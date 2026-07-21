const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const storage = require('../storage');
const config = require('../config');
const auth = require('../middleware/auth');
const language = require('../middleware/language');
const pages = require('./pages');
const clientConstants = require('../clientConstants');
const RateLimiter = require('../ratelimit');

// express's `trust proxy` accepts a boolean, a hop count, or a list of trusted
// addresses. TRUST_PROXY arrives as a string, so map the boolean and numeric
// forms; anything else (an IP/subnet list, or a preset like 'loopback') is
// passed through unchanged.
function parseTrustProxy(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

const apiLimiter = new RateLimiter({
  windowMs: config.rate_limit_window_seconds * 1000,
  max: config.rate_limit_max
});

const IS_DEV = config.env === 'development';
// express 5 uses path-to-regexp v8, which dropped inline regex in route
// parameters: `/api/download/:id([0-9a-fA-F]{10,16})` now throws at startup.
// The constraint still matters, since :id reaches storage and becomes a redis
// key, so it moves into a middleware.
//
// It calls next('route') rather than answering 404 itself. A non-matching id
// previously meant the route did not match at all, so the request fell through
// to express.static and then pages.notfound, which serves the 404 *page*.
// Answering here would return a bare status instead and change what a visitor
// sees.
const ID_REGEX = /^[0-9a-fA-F]{10,16}$/;

function validId(req, res, next) {
  return ID_REGEX.test(req.params.id) ? next() : next('route');
}

module.exports = function(app) {
  // Was `true` (trust every hop), which lets any client set its own req.ip via
  // X-Forwarded-For. That was harmless while nothing read req.ip, but the rate
  // limiter now does, so it must reflect the real proxy depth. Configurable
  // because the right value is deployment-specific.
  app.set('trust proxy', parseTrustProxy(config.trust_proxy));
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

  // no-store keeps pages and API responses out of any cache. no-transform is
  // aimed one layer out: a CDN (Cloudflare's JavaScript Detections / Bot Fight
  // Mode) otherwise injects a third-party <script> into the HTML, reusing this
  // request's CSP nonce so it runs. For a service whose security rests on the
  // served JavaScript being the audited build, that injection breaks the
  // guarantee. no-transform on the origin response makes the CDN pass the HTML
  // through untouched. Static assets get their own no-transform in prod.js.
  app.use(function(req, res, next) {
    res.set('Pragma', 'no-cache');
    res.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate, max-age=0, no-transform'
    );
    next();
  });
  app.use(express.json());
  app.use(express.text());
  // Per-IP limit on the HTTP API. Scoped to /api so it never touches the health
  // endpoints a load balancer polls, the static assets, or the pages. Off in
  // development, like the CSP above: local runs and the frontend test suite
  // legitimately burst requests. The WebSocket upload is limited in routes/ws.js.
  if (!IS_DEV) {
    app.use('/api', apiLimiter.middleware());
  }
  app.get('/', language, pages.index);
  app.get('/config', function(req, res) {
    res.json(clientConstants);
  });
  app.get('/error', language, pages.blank);
  app.get('/app.webmanifest', language, require('./webmanifest'));
  app.get('/download/:id', validId, language, pages.download);
  app.get('/unsupported/:reason', language, pages.unsupported);
  app.get('/api/download/:id', validId, auth.hmac, require('./download'));
  app.get(
    '/api/download/blob/:id',
    validId,
    auth.hmac,
    require('./download')
  );
  app.get('/api/exists/:id', validId, require('./exists'));
  app.get('/api/metadata/:id', validId, auth.hmac, require('./metadata'));
  app.post('/api/delete/:id', validId, auth.owner, require('./delete'));
  app.post('/api/password/:id', validId, auth.owner, require('./password'));
  app.post('/api/params/:id', validId, auth.owner, require('./params'));
  app.post('/api/info/:id', validId, auth.owner, require('./info'));
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
