const crypto = require('crypto');
const storage = require('../storage');
const config = require('../config');
const createLogger = require('../log');
const Limiter = require('../limiter');
const { encryptedSize } = require('../../app/utils');

const { Transform } = require('stream');

const log = createLogger('send.upload');

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
      const newId = crypto.randomBytes(8).toString('hex');
      const owner = crypto.randomBytes(10).toString('hex');

      const fileInfo = JSON.parse(message);
      const timeLimit = fileInfo.timeLimit || config.default_expire_seconds;
      const dlimit = fileInfo.dlimit || config.default_downloads;
      const metadata = fileInfo.fileMetadata;
      const auth = fileInfo.authorization;
      const maxFileSize = config.max_file_size;
      const maxExpireSeconds = config.max_expire_seconds;
      const maxDownloads = config.max_downloads;

      if (
        !metadata ||
        !auth ||
        metadata.length > config.max_metadata_size ||
        timeLimit <= 0 ||
        timeLimit > maxExpireSeconds ||
        dlimit > maxDownloads
      ) {
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
