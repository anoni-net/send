// A small fixed-window per-key rate limiter, self-contained so it adds no
// dependency and can be read in one place. It is used two ways: as express
// middleware for the HTTP API, and as a direct check() for the WebSocket
// upload, which never passes through express middleware.
//
// Keys are client IPs, so it is only as trustworthy as req.ip, which in turn
// depends on `trust proxy` matching the real number of proxies in front of the
// server. See server/routes/index.js.
class RateLimiter {
  constructor({ windowMs, max, maxKeys = 100000 }) {
    this.windowMs = windowMs;
    this.max = max;
    this.maxKeys = maxKeys;
    this.hits = new Map(); // key -> { count, resetAt }
  }

  // true if this hit is within the limit, false if the key is over it. A max of
  // 0 (or less) disables the limiter entirely.
  check(key, now = Date.now()) {
    if (this.max <= 0) {
      return true;
    }
    let entry = this.hits.get(key);
    if (!entry || now >= entry.resetAt) {
      // Reuse the window slot on reset; sweep first if the map has grown large
      // so a churn of distinct keys cannot exhaust memory.
      if (!entry && this.hits.size >= this.maxKeys) {
        this._sweep(now);
      }
      entry = { count: 0, resetAt: now + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count += 1;
    return entry.count <= this.max;
  }

  _sweep(now) {
    for (const [key, entry] of this.hits) {
      if (now >= entry.resetAt) {
        this.hits.delete(key);
      }
    }
    // Still full of live windows (a genuine flood of distinct IPs): drop the
    // soonest-to-reset tenth so new keys can be tracked. Dropped keys just get a
    // fresh window, which is the safe direction (it never over-blocks).
    if (this.hits.size >= this.maxKeys) {
      const byReset = [...this.hits.entries()].sort(
        (a, b) => a[1].resetAt - b[1].resetAt
      );
      const drop = Math.ceil(this.maxKeys * 0.1);
      for (let i = 0; i < drop && i < byReset.length; i++) {
        this.hits.delete(byReset[i][0]);
      }
    }
  }

  // Express middleware. Skips WebSocket upgrades: those are rate-limited at the
  // upload handler instead, and counting the upgrade here would double-count.
  middleware() {
    return (req, res, next) => {
      if (req.headers.upgrade) {
        return next();
      }
      if (this.check(req.ip)) {
        return next();
      }
      res.set('Retry-After', String(Math.ceil(this.windowMs / 1000)));
      return res.sendStatus(429);
    };
  }
}

module.exports = RateLimiter;
