const express = require('express');
const path = require('path');
const config = require('../config');
const routes = require('../routes');
const pages = require('../routes/pages');
const expressWs = require('express-ws');

const app = express();

// maxPayload caps every WebSocket frame. ws defaults to 100 MiB, which is far
// more than this protocol ever sends: the largest observed message is one ECE
// record at 65536 bytes, and the opening JSON is a few hundred. 1 MiB is 16x
// the largest real frame and still bounds what a single message can cost.
// express-ws only forwards WebSocketServer options nested under `wsOptions`.
// They were previously passed at the top level, where express-ws ignores them
// entirely, so the existing perMessageDeflate:false never took effect either.
//
// maxPayload caps every frame. ws defaults to 100 MiB, far more than this
// protocol sends: the largest observed message is one ECE record at 65536
// bytes, and the opening JSON is a few hundred. 1 MiB is 16x the largest real
// frame and still bounds what a single message can cost.
expressWs(app, null, {
  wsOptions: { perMessageDeflate: false, maxPayload: 1024 * 1024 }
});
routes(app);
app.ws('/api/ws', require('../routes/ws'));

app.use(
  express.static(path.resolve(__dirname, '../../dist/'), {
    setHeaders: function(res, path) {
      if (!/serviceWorker\.js$/.test(path)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      res.removeHeader('Pragma');
    }
  })
);

app.use(pages.notfound);

app.listen(config.listen_port, config.listen_address);
