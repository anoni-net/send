const assert = require('assert');
const sinon = require('sinon');
const RateLimiter = require('../../server/ratelimit');

describe('RateLimiter', function() {
  it('allows hits up to the max within a window', function() {
    const rl = new RateLimiter({ windowMs: 1000, max: 3 });
    assert.equal(rl.check('a', 0), true);
    assert.equal(rl.check('a', 100), true);
    assert.equal(rl.check('a', 200), true);
    assert.equal(rl.check('a', 300), false); // 4th in the window
  });

  it('counts each key independently', function() {
    const rl = new RateLimiter({ windowMs: 1000, max: 1 });
    assert.equal(rl.check('a', 0), true);
    assert.equal(rl.check('b', 0), true);
    assert.equal(rl.check('a', 0), false);
  });

  it('resets after the window elapses', function() {
    const rl = new RateLimiter({ windowMs: 1000, max: 1 });
    assert.equal(rl.check('a', 0), true);
    assert.equal(rl.check('a', 999), false);
    assert.equal(rl.check('a', 1000), true); // new window
    assert.equal(rl.check('a', 1500), false);
  });

  it('is disabled when max is 0', function() {
    const rl = new RateLimiter({ windowMs: 1000, max: 0 });
    for (let i = 0; i < 1000; i++) {
      assert.equal(rl.check('a', 0), true);
    }
  });

  it('bounds memory by evicting when maxKeys is exceeded', function() {
    const rl = new RateLimiter({ windowMs: 1000, max: 1, maxKeys: 10 });
    // All within one window so none expire; the sweep must still cap the map.
    for (let i = 0; i < 100; i++) {
      rl.check(`key-${i}`, 0);
    }
    assert.ok(rl.hits.size <= 10, `map grew to ${rl.hits.size}`);
  });

  describe('middleware', function() {
    function res() {
      return { set: sinon.stub(), sendStatus: sinon.stub() };
    }

    it('calls next while under the limit and 429s over it', function() {
      const rl = new RateLimiter({ windowMs: 1000, max: 1 });
      const mw = rl.middleware();
      const next = sinon.stub();

      const r1 = res();
      mw({ ip: '1.2.3.4', headers: {} }, r1, next);
      sinon.assert.calledOnce(next);
      sinon.assert.notCalled(r1.sendStatus);

      const r2 = res();
      mw({ ip: '1.2.3.4', headers: {} }, r2, next);
      sinon.assert.calledOnce(next); // still once
      sinon.assert.calledWith(r2.sendStatus, 429);
      sinon.assert.calledWith(r2.set, 'Retry-After', '1');
    });

    it('skips WebSocket upgrade requests', function() {
      const rl = new RateLimiter({ windowMs: 1000, max: 1 });
      const mw = rl.middleware();
      const next = sinon.stub();
      const r = res();
      // Two upgrades from the same ip must both pass through untouched.
      const headers = { upgrade: 'websocket', connection: 'Upgrade' };
      mw({ ip: '1.2.3.4', headers }, r, next);
      mw({ ip: '1.2.3.4', headers }, r, next);
      sinon.assert.calledTwice(next);
      sinon.assert.notCalled(r.sendStatus);
    });

    // The skip used to test the Upgrade header on its own, so sending one on an
    // ordinary request disabled the limiter for every /api route.
    it('still limits a request carrying only an Upgrade header', function() {
      const rl = new RateLimiter({ windowMs: 1000, max: 1 });
      const mw = rl.middleware();
      const next = sinon.stub();

      mw({ ip: '1.2.3.4', headers: { upgrade: 'websocket' } }, res(), next);
      const r2 = res();
      mw({ ip: '1.2.3.4', headers: { upgrade: 'websocket' } }, r2, next);

      sinon.assert.calledOnce(next);
      sinon.assert.calledWith(r2.sendStatus, 429);
    });

    it('still limits when Connection says something other than upgrade', function() {
      const rl = new RateLimiter({ windowMs: 1000, max: 1 });
      const mw = rl.middleware();
      const next = sinon.stub();
      const headers = { upgrade: 'websocket', connection: 'keep-alive' };

      mw({ ip: '1.2.3.4', headers }, res(), next);
      const r2 = res();
      mw({ ip: '1.2.3.4', headers }, r2, next);

      sinon.assert.calledOnce(next);
      sinon.assert.calledWith(r2.sendStatus, 429);
    });
  });

  describe('isUpgrade', function() {
    const isUpgrade = RateLimiter.isUpgrade;

    it('accepts a real upgrade, including a token list', function() {
      assert.equal(
        isUpgrade({ headers: { upgrade: 'websocket', connection: 'Upgrade' } }),
        true
      );
      // Browsers and proxies send this form.
      assert.equal(
        isUpgrade({
          headers: { upgrade: 'websocket', connection: 'keep-alive, Upgrade' }
        }),
        true
      );
    });

    it('rejects anything that is not a real upgrade', function() {
      const cases = [
        {},
        { upgrade: 'websocket' },
        { connection: 'Upgrade' },
        { upgrade: 'websocket', connection: 'keep-alive' },
        // A substring must not count: "upgrade-insecure-requests" is a real
        // header value that appears in Connection-adjacent contexts.
        { upgrade: 'websocket', connection: 'upgrade-insecure-requests' }
      ];
      for (const headers of cases) {
        assert.equal(isUpgrade({ headers }), false, JSON.stringify(headers));
      }
    });
  });
});
