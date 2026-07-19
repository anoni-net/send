const crypto = require('crypto');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const uaparser = require('ua-parser-js');
const storage = require('../storage');
const config = require('../config');
const auth = require('../middleware/auth');
const language = require('../middleware/language');
const pages = require('./pages');
const clientConstants = require('../clientConstants');

const IS_DEV = config.env === 'development';
const ID_REGEX = '([0-9a-fA-F]{10,16})';

module.exports = function(app) {
  app.set('trust proxy', true);
  // helmet's default bundle now carries its own CSP, which would be sent
  // alongside the nonced policy below. Two policies are intersected by the
  // browser, not replaced, so the result would be whichever is stricter per
  // directive. Ours is applied on its own further down.
  //
  // HSTS is left at helmet's default of one year with includeSubDomains, which
  // is what the previous explicit hsts() call asked for. Note that a CDN in
  // front may override it: send.anoni.net receives 180 days plus preload from
  // Cloudflare rather than what this sends.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(function(req, res, next) {
    req.ua = uaparser(req.header('user-agent'));
    next();
  });
  app.use(function(req, res, next) {
    req.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
  });
  if (!IS_DEV) {
    // Written out in full rather than merged with helmet's defaults. For a
    // service whose security rests on the served JavaScript being the published
    // JavaScript, the policy that enforces it should be readable in one place,
    // not "this list, plus whatever this version of helmet adds".
    const csp = {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        // Without base-uri an injected <base> tag can repoint every relative
        // URL on the page, including the script tags.
        baseUri: ["'self'"],
        connectSrc: [
          "'self'",
          function(req) {
            const baseUrl = config.deriveBaseUrl(req);
            return baseUrl.replace(/^http(s?):\/\//, 'ws$1://');
          }
        ],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          function(req) {
            return `'nonce-${req.cspNonce}'`;
          }
        ],
        // Inline event handler attributes. Safe to forbid: the nanohtml babel
        // transform emits `element.onclick = fn` property assignments, never
        // setAttribute('onclick', ...), so nothing in the app relies on them.
        scriptSrcAttr: ["'none'"],
        styleSrc: [
          "'self'",
          function(req) {
            return `'nonce-${req.cspNonce}'`;
          }
        ],
        // The download path decrypts inside a service worker.
        workerSrc: ["'self'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
        // No report-uri. The old one pointed at /__cspreport__, which has no
        // handler here and returns 404 in production, so violation reports have
        // always been discarded. Collecting them properly means an
        // unauthenticated public POST endpoint, which is its own decision.
      }
    };

    app.use(helmet.contentSecurityPolicy(csp));
  }

  app.use(function(req, res, next) {
    res.set('Pragma', 'no-cache');
    res.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate, max-age=0'
    );
    next();
  });
  app.use(function(req, res, next) {
    try {
      // set by the load balancer
      const [country, state] = req.header('X-Client-Geo-Location').split(',');
      req.geo = {
        country,
        state
      };
    } catch (e) {
      req.geo = {};
    }
    next();
  });
  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.get('/', language, pages.index);
  app.get('/config', function(req, res) {
    res.json(clientConstants);
  });
  app.get('/error', language, pages.blank);
  app.get('/app.webmanifest', language, require('./webmanifest'));
  app.get(`/download/:id${ID_REGEX}`, language, pages.download);
  app.get('/unsupported/:reason', language, pages.unsupported);
  app.get(`/api/download/:id${ID_REGEX}`, auth.hmac, require('./download'));
  app.get(
    `/api/download/blob/:id${ID_REGEX}`,
    auth.hmac,
    require('./download')
  );
  app.get(`/api/exists/:id${ID_REGEX}`, require('./exists'));
  app.get(`/api/metadata/:id${ID_REGEX}`, auth.hmac, require('./metadata'));
  app.post('/api/upload', require('./upload'));
  app.post(`/api/delete/:id${ID_REGEX}`, auth.owner, require('./delete'));
  app.post(`/api/password/:id${ID_REGEX}`, auth.owner, require('./password'));
  app.post(`/api/params/:id${ID_REGEX}`, auth.owner, require('./params'));
  app.post(`/api/info/:id${ID_REGEX}`, auth.owner, require('./info'));
  app.get('/__version__', function(req, res) {
    // Generated by the build; absent in a clean checkout.
    res.sendFile(require.resolve('../../dist/version.json'));
  });

  app.get('/__lbheartbeat__', function(req, res) {
    res.sendStatus(200);
  });

  app.get('/__heartbeat__', async (req, res) => {
    try {
      await storage.ping();
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
    }
  });
};
