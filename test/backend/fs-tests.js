const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');

const FSStorage = require('../../server/storage/fs');

// A source that emits `chunks` and then stays open, so each test decides how it
// ends: normally, destroyed, or destroyed with an error. This is the shape of
// the real upload source, a Limiter transform fed by the WebSocket stream.
function openStream(chunks) {
  const s = new Readable({ read() {} });
  for (const c of chunks) {
    s.push(c);
  }
  return s;
}

describe('FSStorage', function() {
  const log = { info() {}, error() {} };
  let dir;
  let storage;

  beforeEach(function() {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'send-fs-test-'));
    storage = new FSStorage({ file_dir: dir }, log);
  });

  afterEach(function() {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  describe('set', function() {
    it('writes the stream to disk and resolves', async function() {
      const s = openStream(['hello ', 'world']);
      s.push(null);

      await storage.set('1-abcdef0123', s);

      const written = fs.readFileSync(path.join(dir, '1-abcdef0123'), 'utf8');
      assert.equal(written, 'hello world');
    });

    it('settles when the source is destroyed mid-stream', async function() {
      // routes/ws.js destroys the source on every close code other than 1000,
      // which includes 1006: a closed tab or a dropped connection. destroy()
      // with no argument emits 'close' rather than 'error', and under pipe()
      // that settled neither the resolve path ('finish') nor the reject path
      // ('error'), so the write stream was orphaned with its fd open. This
      // assertion is the regression guard: what matters is that it settles.
      const s = openStream(['partial']);
      const p = storage.set('1-abcdef0124', s);
      setImmediate(function() {
        s.destroy();
      });

      await assert.rejects(p, function(err) {
        return err.code === 'ERR_STREAM_PREMATURE_CLOSE';
      });
      assert.equal(fs.existsSync(path.join(dir, '1-abcdef0124')), false);
    });

    it('rejects with the source error object unchanged', async function() {
      // server/limiter.js signals an over-size upload with Error('limit') and
      // routes/ws.js decides between 413 and 500 from it, so the rejection has
      // to carry the source error rather than a wrapper.
      const s = openStream(['too much']);
      const p = storage.set('1-abcdef0125', s);
      setImmediate(function() {
        s.destroy(new Error('limit'));
      });

      await assert.rejects(p, function(err) {
        return err.message === 'limit';
      });
      assert.equal(fs.existsSync(path.join(dir, '1-abcdef0125')), false);
    });

    it('rejects rather than ending the process when file_dir is gone', async function() {
      // file_dir defaults to a directory under the OS temp dir, created once in
      // the constructor, so a /tmp sweeper can remove it under a running
      // server. The write stream then fails at open and leaves no file to clean
      // up, where unlinkSync threw ENOENT from inside an event listener: no
      // promise executor above it, so the process exited.
      fs.rmSync(dir, { recursive: true, force: true });
      const s = openStream(['data']);
      s.push(null);

      await assert.rejects(storage.set('1-abcdef0126', s), function(err) {
        return err.code === 'ENOENT';
      });
    });
  });
});
