const crypto = require('crypto');
const storage = require('../storage');
const config = require('../config');
const createLogger = require('../log');
const Limiter = require('../limiter');
const RateLimiter = require('../ratelimit');
const { encryptedSize } = require('../../app/utils');

const { Transform } = require('stream');

const log = createLogger('send.upload');

// Off in development, matching the HTTP limiter in routes/index.js: the frontend
// test suite bursts uploads from one address.
const IS_DEV = config.env === 'development';

// Per-IP limit on uploads, the expensive disk-writing path. express middleware
// does not see a WebSocket, so the limit is checked here when the upload starts.
const uploadLimiter = new RateLimiter({
  windowMs: config.rate_limit_window_seconds * 1000,
  max: config.upload_rate_limit_max
});

function clientIp(req) {
  return (req && (req.ip || (req.socket && req.socket.remoteAddress))) || '';
}

// Coerce before comparing. The guard used to test the values straight off the
// wire, and every comparison against a non-numeric value is false, so a
// timeLimit of "abc" passed validation intact: it then became the literal
// filename prefix "NaN", which no expiry and no reaper sweep would ever match,
// and the EXPIRE that would have failed is issued only after the file and the
// metadata are already stored. Number() keeps numeric strings working for
// third-party clients and turns everything else into NaN, which `||` replaces
// with the default.
function readUploadRequest(fileInfo) {
  return {
    timeLimit: Number(fileInfo.timeLimit) || config.default_expire_seconds,
    dlimit: Number(fileInfo.dlimit) || config.default_downloads,
    metadata: fileInfo.fileMetadata,
    auth: fileInfo.authorization
  };
}

// The only thing between an unauthenticated client and the storage layer, so it
// is a named function rather than an inline condition, and it is tested
// directly.
function validUploadRequest({ timeLimit, dlimit, metadata, auth }) {
  return (
    // `.length` on an array is its element count and on an object is undefined,
    // so a non-string slipped past the size cap and reached hSet, which throws
    // on it only after the file is on disk.
    typeof metadata === 'string' &&
    metadata.length > 0 &&
    metadata.length <= config.max_metadata_size &&
    !!auth &&
    Number.isInteger(timeLimit) &&
    timeLimit > 0 &&
    timeLimit <= config.max_expire_seconds &&
    Number.isInteger(dlimit) &&
    dlimit > 0 &&
    dlimit <= config.max_downloads
  );
}

module.exports = function(ws, req) {
  let fileStream;

  // A WebSocket is an EventEmitter, so an 'error' with no listener is rethrown
  // and takes the process down. ws emits one for anything malformed on the
  // wire: an invalid UTF-8 text frame, a reserved bit set, a frame over
  // maxPayload. None of that needs authentication, so without this handler a
  // single crafted frame stops the server for everyone. Verified against the
  // unpatched build: one frame with an invalid UTF-8 sequence exits the
  // process with WS_ERR_INVALID_UTF8.
  ws.on('error', e => {
    log.info('wsError', { code: e.code, message: e.message });
    if (fileStream !== undefined) {
      fileStream.destroy();
    }
  });

  ws.on('close', e => {
    if (e !== 1000 && fileStream !== undefined) {
      fileStream.destroy();
    }
  });

  ws.once('message', async function(message) {
    try {
      if (!IS_DEV && !uploadLimiter.check(clientIp(req))) {
        ws.send(JSON.stringify({ error: 429 }));
        return ws.close();
      }

      const newId = crypto.randomBytes(8).toString('hex');
      const owner = crypto.randomBytes(10).toString('hex');

      const fileInfo = JSON.parse(message);
      const { timeLimit, dlimit, metadata, auth } = readUploadRequest(fileInfo);
      const maxFileSize = config.max_file_size;

      if (!validUploadRequest({ timeLimit, dlimit, metadata, auth })) {
        ws.send(
          JSON.stringify({
            error: 400
          })
        );
        return ws.close();
      }

      const meta = {
        owner,
        metadata,
        dlimit,
        auth: auth.split(' ')[1],
        nonce: crypto.randomBytes(16).toString('base64')
      };

      const url = `${config.deriveBaseUrl(req)}/download/${newId}/`;

      ws.send(
        JSON.stringify({
          url,
          ownerToken: meta.owner,
          id: newId
        })
      );
      const limiter = new Limiter(encryptedSize(maxFileSize));
      const eof = new Transform({
        transform: function(chunk, encoding, callback) {
          if (chunk.length === 1 && chunk[0] === 0) {
            this.push(null);
          } else {
            this.push(chunk);
          }
          callback();
        }
      });
      const wsStream = ws.constructor.createWebSocketStream(ws);

      fileStream = wsStream.pipe(eof).pipe(limiter); // limiter needs to be the last in the chain

      await storage.set(newId, fileStream, meta, timeLimit);

      if (ws.readyState === 1) {
        // if the socket is closed by a cancelled upload the stream
        // ends without an error so we need to check the state
        // before sending a reply.

        // TODO: we should handle cancelled uploads differently
        // in order to avoid having to check socket state and clean
        // up storage, possibly with an exception that we can catch.
        ws.send(JSON.stringify({ ok: true }));
      }
    } catch (e) {
      log.error('upload', e);
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            error: e === 'limit' ? 413 : 500
          })
        );
      }
    }
    ws.close();
  });
};

module.exports.readUploadRequest = readUploadRequest;
module.exports.validUploadRequest = validUploadRequest;
