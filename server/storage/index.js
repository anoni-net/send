const config = require('../config');
const Metadata = require('../metadata');
const createLogger = require('../log');
const createRedisClient = require('./redis');

function getPrefix(seconds) {
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
}

module.exports = new DB(config);
