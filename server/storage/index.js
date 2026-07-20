const config = require('../config');
const Metadata = require('../metadata');
const createLogger = require('../log');
const createRedisClient = require('./redis');

// The prefix becomes part of the on-disk filename, and reap() only sweeps names
// matching /^\d+-.../. A non-finite expiry produced the literal name "NaN-<id>",
// which no sweep would ever match and no TTL would ever cover, so the file
// outlived every mechanism meant to remove it. Callers validate their input, but
// this is the boundary where a bad value stops being recoverable, so it refuses
// rather than encoding the damage into a filename.
function getPrefix(seconds) {
  if (!Number.isFinite(seconds)) {
    throw new Error(`invalid expiry: ${seconds}`);
  }
  return Math.max(Math.floor(seconds / 86400), 1);
}

// One atomic step for both reserving and releasing a download slot. EXISTS and
// HINCRBY run together under redis's single-threaded execution, so the count is
// only ever adjusted for a record that is still present: a reserve or release
// that races behind storage.del() returns -1 and touches nothing, rather than
// letting HINCRBY recreate a spent id as a TTL-less ghost hash. Returns the new
// counter value, or -1 when the record no longer exists.
const ADJUST_DOWNLOAD = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('HINCRBY', KEYS[1], ARGV[1], ARGV[2])`;

// The S3 and GCS SDKs are not installed in the published image. Together they
// pull in over half of the production dependency tree for backends that a
// filesystem deployment never loads, so they moved to devDependencies: the
// tests still exercise both, and anyone deploying against S3 or GCS installs
// them alongside Send.
//
// Without this, that mistake surfaces as a bare MODULE_NOT_FOUND from a require
// three directories down, which says nothing about what to do next.
// `load` is a thunk rather than a backend name so the require stays literal:
// a computed require would defeat static analysis for no benefit here.
function loadStorage(load, name, packages) {
  try {
    return load();
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    throw new Error(
      `The ${name} storage backend is configured but its SDK is not installed. ` +
        `Run: npm install ${packages.join(' ')}`,
      { cause: e }
    );
  }
}

class DB {
  constructor(config) {
    let Storage;
    if (config.s3_bucket) {
      Storage = loadStorage(() => require('./s3'), 'S3', [
        '@aws-sdk/client-s3',
        '@aws-sdk/lib-storage'
      ]);
    } else if (config.gcs_bucket) {
      Storage = loadStorage(() => require('./gcs'), 'GCS', [
        '@google-cloud/storage'
      ]);
    } else {
      Storage = require('./fs');
    }
    this.log = createLogger('send.storage');

    this.storage = new Storage(config, this.log);

    this.redis = createRedisClient(config);
    this.redis.on('error', err => {
      this.log.error('Redis:', err);
    });
  }

  async ttl(id) {
    const result = await this.redis.ttl(id);
    return Math.ceil(result) * 1000;
  }

  async getPrefixedId(id) {
    const prefix = await this.redis.hGet(id, 'prefix');
    return `${prefix}-${id}`;
  }

  async length(id) {
    const filePath = await this.getPrefixedId(id);
    return this.storage.length(filePath);
  }

  async get(id) {
    const filePath = await this.getPrefixedId(id);
    return this.storage.getStream(filePath);
  }

  async set(id, file, meta, expireSeconds = config.default_expire_seconds) {
    const prefix = getPrefix(expireSeconds);
    const filePath = `${prefix}-${id}`;
    await this.storage.set(filePath, file);
    await this.redis.hSet(id, 'prefix', String(prefix));
    if (meta) {
      await this.redis.hSet(id, meta);
    }
    await this.redis.expire(id, expireSeconds);
  }

  setField(id, key, value) {
    // Coerce to string: redis stores strings and node-redis v4 rejects
    // non-string/number values (e.g. the boolean `pwd`). Callers may not await,
    // so guard the promise to avoid an unhandled rejection.
    const p = this.redis.hSet(id, key, String(value));
    p.catch(err => this.log.error('setField:', err));
    return p;
  }

  // Atomically claim one download slot before a byte is streamed. Returns the
  // new download count, or -1 if the record is already gone (spent or expired)
  // so the caller can 404 without recreating its key. The check-and-increment
  // is one atomic step, which is what stops concurrent requests for a
  // one-download file from all reading the same pre-increment count.
  reserveDownload(id) {
    return this.redis.eval(ADJUST_DOWNLOAD, {
      keys: [id],
      arguments: ['dl', '1']
    });
  }

  // Hand a reserved slot back (over the limit, or a download that failed before
  // completing). A no-op returning -1 if the record is already gone, so a
  // release racing behind a delete can never resurrect a spent file.
  releaseDownload(id) {
    return this.redis.eval(ADJUST_DOWNLOAD, {
      keys: [id],
      arguments: ['dl', '-1']
    });
  }

  async del(id) {
    const filePath = await this.getPrefixedId(id);
    await this.storage.del(filePath);
    await this.redis.del(id);
  }

  async ping() {
    await this.redis.ping();
    await this.storage.ping();
  }

  async metadata(id) {
    const result = await this.redis.hGetAll(id);
    return result && Object.keys(result).length > 0
      ? new Metadata(result)
      : null;
  }

  // Delete files whose redis record has expired. redis holds the only expiry
  // TTL; when it fires the metadata hash vanishes, but neither the download nor
  // the delete path removes the file it pointed at, so an uploaded-but-never-
  // downloaded file would otherwise stay on disk (and readable) forever. Only
  // the filesystem backend exposes list(); S3/GCS return early and use bucket
  // lifecycle rules instead.
  async reap(
    graceMs = config.reap_grace_seconds * 1000,
    now = Date.now()
  ) {
    if (typeof this.storage.list !== 'function') {
      return 0;
    }
    // `${prefix}-${id}`: prefix is the day bucket, id is 10-16 hex chars.
    const FILE = /^\d+-[0-9a-fA-F]{10,16}$/;
    let reaped = 0;
    const files = await this.storage.list();
    for (const { name, mtimeMs } of files) {
      // Ignore anything that isn't a Send upload, and anything written within
      // the grace window: storage.set() writes the file before its redis key,
      // so a just-finished upload can briefly have no key. Skipping recent
      // files keeps the sweep from racing that gap and deleting a live upload.
      if (!FILE.test(name) || now - mtimeMs < graceMs) {
        continue;
      }
      const id = name.slice(name.indexOf('-') + 1);
      try {
        if ((await this.redis.exists(id)) === 0) {
          await this.storage.del(name);
          reaped += 1;
        }
      } catch (e) {
        // Redis unreachable, or the delete failed: never remove a file we could
        // not confirm is orphaned. Skip it and try again on the next sweep.
        this.log.warn('reap', e);
      }
    }
    if (reaped > 0) {
      this.log.info('reaped', { count: reaped });
    }
    return reaped;
  }
}

module.exports = new DB(config);
