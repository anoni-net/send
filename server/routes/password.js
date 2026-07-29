const storage = require('../storage');
const createLogger = require('../log');

const log = createLogger('send.password');

module.exports = async function(req, res) {
  const id = req.params.id;
  const auth = req.body.auth;
  if (!auth) {
    return res.sendStatus(400);
  }

  // One call for both fields, awaited. As two un-awaited calls this reported
  // 200 before either write landed: with redis unavailable the sender saw the
  // password set on a file that had none, and a half-applied pair left `auth`
  // stored while /api/exists still answered requiresPassword:false, so the
  // recipient's client never prompted and looped on 401.
  try {
    const written = await storage.setFields(id, { auth, pwd: true });
    if (written < 0) {
      // Expired or deleted between the owner check and here.
      return res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (e) {
    log.error('setPassword', e);
    res.sendStatus(500);
  }
};
