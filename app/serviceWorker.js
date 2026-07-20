import assets from '../common/assets';
// webpack 5: JSON modules only expose a default export; destructure it instead
// of using a named import (which webpack warns is deprecated).
import pkg from '../package.json';
import Keychain from './keychain';

const { version } = pkg;
import { downloadStream } from './api';
import { transformStream } from './streams';
import Zip from './zip';
import contentDisposition from 'content-disposition';

let noSave = false;
const map = new Map();
// The leading `.*` used to be here and did nothing: with `$` and no `^`, match
// already searches anywhere in the string. It was not free, though. Greedy
// `.*` backtracking against a non-matching string made this quadratic, 15
// seconds on 200k characters, against 0.006 ms without it. The input is our own
// asset list so it was never reachable, but there is no reason to keep it.
const IMAGES = /\.(png|svg|jpg)$/;
/* eslint-disable-next-line security/detect-unsafe-regex --
   Unlike IMAGES above, this one measures clean: the {8} run is anchored by a
   literal dot on both sides, so there is nothing for the engine to backtrack
   over. 200k characters of worst-case input takes 0.146 ms, against 15,367 ms
   for the regex above before it was fixed. The heuristic flags the shape, not a
   real path. This is worth keeping honest because `url` here comes from the
   fetch event, so it is one of the few regexes an outside page can feed. */
const VERSIONED_ASSET = /\.[A-Fa-f0-9]{8}\.(js|css|png|svg|jpg)(#\w+)?$/;
const DOWNLOAD_URL = /\/api\/download\/([A-Fa-f0-9]{4,})/;
const FONT = /\.woff2?$/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim().then(precache));
});

async function decryptStream(id) {
  const file = map.get(id);
  if (!file) {
    return new Response(null, { status: 400 });
  }
  try {
    let size = file.size;
    let type = file.type;
    const keychain = new Keychain(file.key, file.nonce);
    if (file.requiresPassword) {
      keychain.setPassword(file.password, file.url);
    }

    file.download = downloadStream(id, keychain);

    const body = await file.download.result;

    const decrypted = keychain.decryptStream(body);

    let zipStream = null;
    if (file.type === 'send-archive') {
      const zip = new Zip(file.manifest, decrypted);
      zipStream = zip.stream;
      type = 'application/zip';
      size = zip.size;
    }
    const responseStream = transformStream(
      zipStream || decrypted,
      {
        transform(chunk, controller) {
          file.progress += chunk.length;
          controller.enqueue(chunk);
        }
      },
      function oncancel() {
        // NOTE: cancel doesn't currently fire on chrome
        // https://bugs.chromium.org/p/chromium/issues/detail?id=638494
        file.download.cancel();
        map.delete(id);
      }
    );

    const headers = {
      'Content-Disposition': contentDisposition(file.filename),
      'Content-Type': type,
      'Content-Length': size
    };
    return new Response(responseStream, { headers });
  } catch (e) {
    // Record why, so the client's progress poll can report it. The response is
    // a poor channel here: this request was started by a top-level navigation,
    // so anything with a body, an error status, or a redirect takes the user
    // off the page and destroys the very state that was tracking the download.
    file.error = errorStatus(e);
    file.retryAfter = e && e.retryAfter;

    if (noSave) {
      return new Response(null, { status: file.error });
    }

    // 204 keeps the browser exactly where it is: no navigation, no reload, no
    // browser error page. The download page stays mounted and its polling loop
    // picks up file.error on the next tick.
    //
    // This used to be a 302 back to the download page, which reloaded it. So a
    // rate-limited or expired download looked like the Download button simply
    // did nothing, and it masked 404s on the streaming path too.
    return new Response(null, { status: 204 });
  }
}

// e.message is a status only when the failure came from the download request
// itself. A crypto failure carries text like 'no delimiter found', and
// `new Response(null, { status: text })` throws RangeError, so the integrity
// failure that the ECE delimiter check exists to catch was the case reported
// worst of all.
function errorStatus(e) {
  const status = Number(e && e.message);
  return Number.isInteger(status) && status >= 200 && status <= 599
    ? status
    : 500;
}

async function precache() {
  try {
    await cleanCache();
    const cache = await caches.open(version);
    const images = assets.match(IMAGES);
    await cache.addAll(images);
  } catch (e) {
    console.error(e);
    // cache will get populated on demand
  }
}

async function cleanCache() {
  const oldCaches = await caches.keys();
  for (const c of oldCaches) {
    if (c !== version) {
      await caches.delete(c);
    }
  }
}

function cacheable(url) {
  return VERSIONED_ASSET.test(url) || FONT.test(url);
}

async function cachedOrFetched(req) {
  const cache = await caches.open(version);
  const cached = await cache.match(req);
  if (cached) {
    return cached;
  }
  const fetched = await fetch(req);
  if (fetched.ok && cacheable(req.url)) {
    cache.put(req, fetched.clone());
  }
  return fetched;
}

self.onfetch = event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const dlmatch = DOWNLOAD_URL.exec(url.pathname);
  if (dlmatch) {
    event.respondWith(decryptStream(dlmatch[1]));
  } else if (cacheable(url.pathname)) {
    event.respondWith(cachedOrFetched(req));
  }
};

self.onmessage = event => {
  if (event.data.request === 'init') {
    noSave = event.data.noSave;
    const info = {
      key: event.data.key,
      nonce: event.data.nonce,
      filename: event.data.filename,
      requiresPassword: event.data.requiresPassword,
      password: event.data.password,
      url: event.data.url,
      type: event.data.type,
      manifest: event.data.manifest,
      size: event.data.size,
      progress: 0
    };
    map.set(event.data.id, info);

    event.ports[0].postMessage('file info received');
  } else if (event.data.request === 'progress') {
    const file = map.get(event.data.id);
    if (!file) {
      event.ports[0].postMessage({ error: 'cancelled' });
    } else if (file.error !== undefined) {
      // The fetch failed. Report it once and drop the entry, so the client
      // raises the real status instead of waiting out a progress counter that
      // will never move.
      map.delete(event.data.id);
      event.ports[0].postMessage({
        error: String(file.error),
        retryAfter: file.retryAfter
      });
    } else {
      if (file.progress === file.size) {
        map.delete(event.data.id);
      }
      event.ports[0].postMessage({ progress: file.progress });
    }
  } else if (event.data.request === 'cancel') {
    const file = map.get(event.data.id);
    if (file) {
      if (file.download) {
        file.download.cancel();
      }
      map.delete(event.data.id);
    }
    event.ports[0].postMessage('download cancelled');
  }
};
