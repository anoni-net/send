const config = require('../config');
const Metadata = require('../metadata');
const mozlog = require('../log');
const createRedisClient = require('./redis');

function getPrefix(seconds) {
  return Math.max(Math.floor(seconds / 86400), 1);
}

class DB {
  constructor(config) {
    let Storage;
    if (config.s3_bucket) {
      Storage = require('./s3');
    } else if (config.gcs_bucket) {
      Storage = require('./gcs');
    } else {
      Storage = require('./fs');
    }
    this.log = mozlog('send.storage');

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

  incrementField(id, key, increment = 1) {
    return this.redis.hIncrBy(id, key, increment);
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
