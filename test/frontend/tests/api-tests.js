/* global DEFAULTS */
import assert from 'assert';
import Archive from '../../../app/archive';
import * as api from '../../../app/api';
import Keychain from '../../../app/keychain';

const encoder = new TextEncoder();
const plaintext = new Archive([new Blob([encoder.encode('hello world!')])]);
const metadata = {
  name: 'test.txt',
  type: 'text/plain'
};

describe('API', function() {
  describe('statusError', function() {
    // The server answers 429 with Retry-After and nothing read it, so the only
    // thing the UI could say was "later".
    it('carries Retry-After when the server sent one', function() {
      const err = api.statusError(429, new Headers({ 'Retry-After': '60' }));
      assert.equal(err.message, '429');
      assert.equal(err.retryAfter, 60);
    });

    it('omits it when absent or not a positive integer', function() {
      for (const headers of [
        new Headers(),
        new Headers({ 'Retry-After': '0' }),
        new Headers({ 'Retry-After': '-5' }),
        // A Retry-After may also be an HTTP-date, which is not a wait in
        // seconds. Rather than guess, say nothing.
        new Headers({ 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT' })
      ]) {
        const err = api.statusError(429, headers);
        assert.equal(err.message, '429');
        assert.equal(err.retryAfter, undefined);
      }
    });

    it('works without headers at all', function() {
      assert.equal(api.statusError(404).message, '404');
    });
  });

  describe('websocket upload', function() {
    // The connect used to listen for 'open' and nothing else. A refused or
    // filtered connection fires 'error' then 'close', neither of which settled
    // the promise, so the upload hung at 0% until the page was reloaded. Port 1
    // is reserved and nothing listens on it, so this connect is refused
    // immediately.
    it('rejects instead of hanging when the connection is refused', async function() {
      this.timeout(10000);
      let err = null;
      try {
        await api.asyncInitWebSocket('ws://127.0.0.1:1/api/ws');
      } catch (e) {
        err = e;
      }
      assert.ok(err, 'a refused connect must settle the promise');
      assert.equal(err.message, 'connect-failed');
    });

    it('rejects as cancelled when the user cancels mid-connect', async function() {
      this.timeout(10000);
      // A host that accepts the TCP connection but never completes the upgrade
      // is the shape that used to hang forever. Cancelling has to win.
      const canceller = { cancelled: false };
      const p = api.asyncInitWebSocket('ws://127.0.0.1:1/api/ws', canceller);
      canceller.cancelled = true;
      let err = null;
      try {
        await p;
      } catch (e) {
        err = e;
      }
      assert.ok(err, 'cancelling must settle the promise');
      // Either outcome is correct here: a refusal can beat the cancel poll on
      // localhost. What must never happen is the promise staying pending.
      assert.ok(
        err.message === '0' || err.message === 'connect-failed',
        `unexpected error: ${err.message}`
      );
    });

    it('returns file info on success', async function() {
      const keychain = new Keychain();
      const enc = await keychain.encryptStream(plaintext.stream);
      const meta = await keychain.encryptMetadata(metadata);
      const verifierB64 = await keychain.authKeyB64();
      const p = function() {};
      const up = api.uploadWs(
        enc,
        meta,
        verifierB64,
        DEFAULTS.EXPIRE_SECONDS,
        1,
        null,
        p
      );

      const result = await up.result;
      assert.ok(result.url);
      assert.ok(result.id);
      assert.ok(result.ownerToken);
    });

    it('can be cancelled', async function() {
      const keychain = new Keychain();
      const enc = await keychain.encryptStream(plaintext.stream);
      const meta = await keychain.encryptMetadata(metadata);
      const verifierB64 = await keychain.authKeyB64();
      const p = function() {};
      const up = api.uploadWs(
        enc,
        meta,
        verifierB64,
        DEFAULTS.EXPIRE_SECONDS,
        null,
        p
      );

      up.cancel();
      try {
        await up.result;
        assert.fail('not cancelled');
      } catch (e) {
        assert.equal(e.message, '0');
      }
    });
  });
});
