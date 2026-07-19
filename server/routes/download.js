const { pipeline } = require('stream');
const storage = require('../storage');
const createLogger = require('../log');
const log = createLogger('send.download');

module.exports = async function(req, res) {
  const id = req.params.id;
  const dlimit = req.meta.dlimit;

  // Reserve a download slot atomically before streaming a byte. reserveDownload
  // increments the stored count and returns the new value, or -1 if the record
  // is already gone. The old code decided whether the file was spent only after
  // the stream finished, from a meta.dl captured at the start of the request, so
  // simultaneous downloads of a one-download file all read dl=0 and all
  // succeeded. Deciding on the atomic post-increment value closes that: of N
  // concurrent requests, only the first `dlimit` get a value within the limit.
  const dl = await storage.reserveDownload(id);
  if (dl < 0) {
    return res.sendStatus(404);
  }
  if (dl > dlimit) {
    // Over the limit: hand the slot back and refuse.
    await storage.releaseDownload(id);
    return res.sendStatus(404);
  }

  let contentLength;
  let fileStream;
  try {
    contentLength = await storage.length(id);
    fileStream = await storage.get(id);
  } catch (e) {
    // Nothing has been streamed yet: release the slot and 404, as before.
    await storage.releaseDownload(id);
    return res.sendStatus(404);
  }

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': contentLength
  });

  // pipeline gives one completion callback for success, client abort, and read
  // error alike, and destroys both streams on failure.
  pipeline(fileStream, res, async err => {
    if (err) {
      // Failed or cancelled midway: release the slot so a dropped connection
      // does not consume a download the recipient never received.
      try {
        await storage.releaseDownload(id);
      } catch (e) {
        log.info('StorageError:', id);
      }
      return;
    }
    if (dl === dlimit) {
      // This request took the final slot: the file is spent, delete it.
      try {
        await storage.del(id);
      } catch (e) {
        log.info('StorageError:', id);
      }
    }
  });
};
