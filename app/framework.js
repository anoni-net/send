const nanomorph = require('nanomorph');
const Nanobus = require('nanobus');

/*
 * Replaces choo, which brought 13 further packages into the bundle for a
 * feature set this app uses about a tenth of: seven routes, three `.use()`
 * plugins, an emitter, and a diffed re-render.
 *
 * What is deliberately NOT reimplemented, having checked each against the app:
 *
 *   link interception (nanohref)  The app has four internal links and all four
 *                                 point at "/". A normal browser navigation
 *                                 reaches the same page, server-rendered. The
 *                                 edge cases a click interceptor has to get
 *                                 right (modifier keys, target, download,
 *                                 external hosts, mailto) are more code to
 *                                 audit than the behaviour is worth.
 *   scroll-to-anchor              choo scrolls to `location.hash` after every
 *                                 navigation. Our hash is the encryption key,
 *                                 so getElementById never matches and the call
 *                                 has always done nothing.
 *   replaceState, navigate        no caller.
 *   nanotiming                    performance marks, disabled in production.
 *
 * The one piece of choo behaviour that is load-bearing for end-to-end
 * encryption is hash routing, see matchRoute below.
 */

// choo's `hash: true` appends the URL fragment to the path before matching, so
// /download/abc#KEY is routed as /download/abc/KEY. That is how the secret key
// reaches state.params.key and then FileReceiver: routes.js registers both
// /download/:id and /download/:id/:key for exactly this reason.
//
// The fragment is never sent to a server by any user agent, which is what makes
// it the right place for the key. Nothing here may put it into a request URL.
function routeToMatcher(pattern) {
  return {
    pattern,
    // nanorouter reported the matched route with the leading slash stripped,
    // except for the root which stayed "/". Only `state.route === '/'` is ever
    // compared (pasteManager, dragManager, controller), so the rest of the
    // shape does not matter, but keeping it identical means this refactor
    // changes no observable value at all.
    name: pattern === '/' ? '/' : pattern.replace(/^\//, ''),
    parts: pattern.split('/').filter(Boolean),
    wildcard: pattern === '*'
  };
}

function matchRoute(routes, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  let wildcard = null;
  for (const route of routes) {
    if (route.matcher.wildcard) {
      wildcard = route;
      continue;
    }
    const parts = route.matcher.parts;
    if (parts.length !== segments.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.startsWith(':')) {
        // wayfarer decodes each captured segment; base64url keys are unaffected
        // but stay faithful to it so nothing changes for other params.
        params[p.slice(1)] = decodeURIComponent(segments[i]);
      } else if (p !== segments[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  // nanorouter also set params.wildcard on the catch-all route, and set it to
  // the literal "404" for some inputs rather than the path. Nothing reads it,
  // so it is not carried over rather than reproduced with its quirk intact.
  return wildcard ? { route: wildcard, params: {} } : null;
}

// Collapses the burst of render() calls the controller makes (17 call sites,
// and upload progress fires one per chunk) into one repaint, which is what
// choo used nanoraf for.
function rafThrottle(fn) {
  if (typeof window === 'undefined' || !window.requestAnimationFrame) {
    return fn;
  }
  let scheduled = false;
  return function() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function() {
      scheduled = false;
      fn();
    });
  };
}

function onDocumentReady(cb) {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(cb, 0);
  } else {
    document.addEventListener('DOMContentLoaded', cb);
  }
}

class App {
  constructor() {
    this.routes = [];
    this.stores = [];
    this.emitter = new Nanobus('app.emit');
    this.emit = this.emitter.emit.bind(this.emitter);
    this._tree = null;

    const base = {};
    if (typeof window !== 'undefined') {
      // choo merged window.initialState and then removed it, so the state the
      // server embedded cannot be read a second time.
      this.state = window.initialState
        ? Object.assign({}, window.initialState, base)
        : base;
      delete window.initialState;
      this.state.title = document.title;
    } else {
      this.state = base;
    }
  }

  route(pattern, handler) {
    this.routes.push({ matcher: routeToMatcher(pattern), handler });
  }

  use(cb) {
    this.stores.push(cb);
  }

  _match(state, locationOverride) {
    let pathname;
    if (locationOverride !== undefined) {
      pathname = locationOverride.replace(/\?.+$/, '').replace(/\/$/, '');
    } else {
      pathname = window.location.pathname.replace(/\/$/, '');
      // see the note above: this is what carries the key into params
      pathname += window.location.hash.replace(/^#/, '/');
    }
    const matched = matchRoute(this.routes, pathname);
    if (!matched) {
      throw new Error(`no route matched ${pathname}`);
    }
    this._handler = matched.route.handler;
    state.href = pathname;
    state.route = matched.route.matcher.name;
    state.params = matched.params;
    return matched;
  }

  _render(state) {
    return this._handler(state, this.emit);
  }

  _initStores(state) {
    for (const store of this.stores) {
      store(state, this.emitter, this);
    }
  }

  // Server-side render. Called fresh per request from server/routes/pages.js,
  // so nothing here may be cached across calls.
  toString(location, state) {
    state = state || {};
    this._match(state, location);
    this.emitter.removeAllListeners();
    this._initStores(state);
    const tree = this._render(state);
    if (!tree) {
      throw new Error(`no value returned for route ${location}`);
    }
    return typeof tree.outerHTML === 'string'
      ? tree.outerHTML
      : tree.toString();
  }

  mount(selector) {
    onDocumentReady(() => {
      this.emitter.on('DOMTitleChange', title => {
        this.state.title = title;
        document.title = title;
      });
      this.emitter.on('pushState', href => {
        window.history.pushState({}, null, href);
        this._navigate();
      });
      window.addEventListener('popstate', () => this._navigate());

      this._match(this.state);
      this._initStores(this.state);

      const tree = this._render(this.state);
      this._tree = document.querySelector(selector);
      nanomorph(this._tree, tree);

      this.emitter.on(
        'render',
        rafThrottle(() => {
          nanomorph(this._tree, this._render(this.state));
        })
      );

      this.emitter.emit('DOMContentLoaded');
    });
  }

  _navigate() {
    this._match(this.state);
    if (this._tree) {
      nanomorph(this._tree, this._render(this.state));
    }
  }
}

module.exports = function createApp() {
  return new App();
};
