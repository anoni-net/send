const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const stream = {};
class MockStorage {
  length() {
    return Promise.resolve(12);
  }
  getStream() {
    return stream;
  }
  set() {
    return Promise.resolve();
  }
  del() {
    return Promise.resolve();
  }
  ping() {
    return Promise.resolve();
  }
}

const config = {
  s3_bucket: 'foo',
  default_expire_seconds: 20,
  expire_times_seconds: [10, 20, 30],
  env: 'development',
  redis_host: 'localhost'
};

// In-memory stand-in for the node-redis v4+ client (promise API) so these
// storage unit tests stay hermetic and need no running redis. Implements only
// the commands server/storage/index.js uses.
function createFakeRedis() {
  const hashes = new Map();
  const ttls = new Map();
  const hash = k => {
    if (!hashes.has(k)) hashes.set(k, new Map());
    return hashes.get(k);
  };
  return {
    on() {},
    async connect() {},
    async hSet(key, fieldOrObj, value) {
      const m = hash(key);
      if (typeof fieldOrObj === 'object') {
        for (const [f, v] of Object.entries(fieldOrObj)) m.set(f, String(v));
      } else {
        m.set(fieldOrObj, String(value));
      }
    },
    async hGet(key, field) {
      const m = hashes.get(key);
      return m && m.has(field) ? m.get(field) : null;
    },
    async hGetAll(key) {
      const m = hashes.get(key);
      return m ? Object.fromEntries(m) : {};
    },
    async hIncrBy(key, field, n) {
      const m = hash(key);
      const next = Number(m.get(field) || 0) + n;
      m.set(field, String(next));
      return next;
    },
    async expire(key, seconds) {
      ttls.set(key, seconds);
      return true;
    },
    async ttl(key) {
      return ttls.has(key) ? ttls.get(key) : -1;
    },
    async del(key) {
      hashes.delete(key);
      ttls.delete(key);
      return 1;
    },
    async ping() {
      return 'PONG';
    }
  };
}

const storage = proxyquire('../../server/storage', {
  '../config': config,
  '../log': () => {},
  './s3': MockStorage,
  './redis': () => createFakeRedis()
});

describe('Storage', function() {
  describe('ttl', function() {
    it('returns milliseconds remaining', async function() {
      const time = 40;
      await storage.set('x', null, { foo: 'bar' }, time);
      const ms = await storage.ttl('x');
      await storage.del('x');
      assert.equal(ms, time * 1000);
    });
  });

  describe('length', function() {
    it('returns the file size', async function() {
      const len = await storage.length('x');
      assert.equal(len, 12);
    });
  });

  describe('get', function() {
    it('returns a stream', async function() {
      const s = await storage.get('x');
      assert.equal(s, stream);
    });
  });

  describe('set', function() {
    it('sets expiration to expire time', async function() {
      const seconds = 100;
      await storage.set('x', null, { foo: 'bar' }, seconds);
      const s = await storage.redis.ttl('x');
      await storage.del('x');
      assert.equal(Math.ceil(s), seconds);
    });

    it('adds right prefix based on expire time', async function() {
      await storage.set('x', null, { foo: 'bar' }, 300);
      const path_x = await storage.getPrefixedId('x');
      assert.equal(path_x, '1-x');
      await storage.del('x');

      await storage.set('y', null, { foo: 'bar' }, 86400);
      const path_y = await storage.getPrefixedId('y');
      assert.equal(path_y, '1-y');
      await storage.del('y');

      await storage.set('z', null, { foo: 'bar' }, 86400 * 7);
      const path_z = await storage.getPrefixedId('z');
      assert.equal(path_z, '7-z');
      await storage.del('z');
    });

    it('sets metadata', async function() {
      const m = { foo: 'bar' };
      await storage.set('x', null, m);
      const meta = await storage.redis.hGetAll('x');
      delete meta.prefix;
      await storage.del('x');
      assert.deepEqual(meta, m);
    });
  });

  describe('setField', function() {
    it('works', async function() {
      await storage.set('x', null);
      storage.setField('x', 'y', 'z');
      const z = await storage.redis.hGet('x', 'y');
      assert.equal(z, 'z');
      await storage.del('x');
    });
  });

  describe('del', function() {
    it('works', async function() {
      await storage.set('x', null, { foo: 'bar' });
      await storage.del('x');
      const meta = await storage.metadata('x');
      assert.equal(meta, null);
    });
  });

  describe('ping', function() {
    it('works', async function() {
      await storage.ping();
    });
  });

  describe('metadata', function() {
    it('returns all metadata fields', async function() {
      const m = {
        pwd: true,
        dl: 1,
        dlimit: 1,
        auth: 'foo',
        metadata: 'bar',
        nonce: 'baz',
        owner: 'bmo'
      };
      await storage.set('x', null, m);
      const meta = await storage.metadata('x');
      assert.deepEqual(meta, m);
    });
  });
});
