const config = require('../config');
const storage = require('../storage');
const createLogger = require('../log');

const log = createLogger('send.params');

module.exports = async function(req, res) {
  const max = config.max_downloads;
  const dlimit = req.body.dlimit;
  if (!dlimit || dlimit > max) {
    return res.sendStatus(400);
  }

  // Awaited, so the status reflects the write. This handler was synchronous and
  // fired setField without awaiting, which left the failure branch unreachable
  // and answered 200 for a write that had not happened yet.
  try {
    const written = await storage.setField(req.params.id, 'dlimit', dlimit);
    if (written < 0) {
      // Expired or deleted between the owner check and here.
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (e) {
    log.error('setParams', e);
    res.sendStatus(500);
  }
};
