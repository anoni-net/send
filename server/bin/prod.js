const express = require('express');
const path = require('path');
const config = require('../config');
const storage = require('../storage');
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
        // no-transform so a CDN (e.g. Cloudflare Polish) cannot re-compress
        // images or otherwise rewrite these files. VERIFYING.md promises the
        // served bytes match dist/ exactly; a transform would break byte-for-
        // byte verification behind a CDN.
        res.set(
          'Cache-Control',
          'public, max-age=31536000, immutable, no-transform'
        );
      }
      res.removeHeader('Pragma');
    }
  })
);

app.use(pages.notfound);

// Sweep files whose redis record has expired. Started here (not in dev/test)
// because it should run once per deployed process. unref() so it never keeps a
// shutting-down process alive; app.listen holds the process open otherwise.
if (config.reap_interval_seconds > 0) {
  const timer = setInterval(() => {
    storage.reap().catch(() => {});
  }, config.reap_interval_seconds * 1000);
  timer.unref();
}

app.listen(config.listen_port, config.listen_address);
