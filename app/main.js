/* global DEFAULTS LIMITS WEB_UI */
import createApp from './framework';
import routes from './routes';
import getCapabilities from './capabilities';
import controller from './controller';
import dragManager from './dragManager';
import pasteManager from './pasteManager';
import storage from './storage';
import './main.css';
import { getTranslator } from './locale';
import Archive from './archive';
import { setTranslate, locale } from './utils';

// Resolve once a worker controls this page, or after the wait, whichever comes
// first. Bounded rather than open-ended: if claim() never lands the caller falls
// back to the non-streaming download, which is slower but works, instead of the
// page hanging before it renders.
const CONTROL_WAIT_MS = 4000;

function controllingWorker() {
  if (navigator.serviceWorker.controller) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('controllerchange', done);
      resolve();
    };
    const timer = setTimeout(done, CONTROL_WAIT_MS);
    navigator.serviceWorker.addEventListener('controllerchange', done);
  });
}

(async function start() {
  const capabilities = await getCapabilities();
  if (!capabilities.crypto) {
    // WebCrypto is unavailable on any origin the browser does not consider
    // secure, so an instance served over plain http fails this check on every
    // browser ever made. Saying "your browser is not supported" there sends the
    // visitor to troubleshoot something that is not broken, and the operator
    // never hears about the real cause.
    const reason = window.isSecureContext === false ? 'insecure' : 'crypto';
    if (window.location.pathname !== `/unsupported/${reason}`) {
      return window.location.assign(`/unsupported/${reason}`);
    }
  }
  if (capabilities.serviceWorker) {
    try {
      await navigator.serviceWorker.register('/serviceWorker.js');
      await navigator.serviceWorker.ready;
      // `ready` resolves on an active worker, which is not the same as one
      // controlling this page. On a first visit the page was loaded before any
      // worker existed, so navigator.serviceWorker.controller stays null until
      // the worker's clients.claim() takes effect, and that is a separate
      // asynchronous step. The streaming download path posts to `controller`
      // directly, so arriving straight at a download link raced it: the user
      // saw an error page for a good link, and retrying spent another download
      // from the file's limit.
      await controllingWorker();
      if (!navigator.serviceWorker.controller) {
        capabilities.streamDownload = false;
      }
    } catch (e) {
      // continue but disable streaming downloads
      capabilities.streamDownload = false;
    }
  }

  const translate = await getTranslator(locale());
  setTranslate(translate);

  /* eslint-disable-next-line require-atomic-updates --
     module bootstrap, runs once before anything else can touch window. */
  window.initialState = {
    LIMITS,
    DEFAULTS,
    WEB_UI,
    archive: new Archive([], DEFAULTS.EXPIRE_SECONDS, DEFAULTS.DOWNLOADS),
    capabilities,
    translate,
    storage,
    transfer: null,
    fileInfo: null,
    locale: locale()
  };

  const app = routes(createApp());

  // No `window.app = app`. Nothing in app/ read it, and through app.state it
  // handed anything running in the page (an extension content script, a
  // devtools paste, a future injection) state.params.key, state.fileInfo
  // .secretKey and the live Keychain with its rawSecret, already decoded and
  // ready to use. None of that is capability the #fragment does not already
  // give, so this removes convenience rather than a leak, but the convenience
  // was only ever on the attacker's side.
  app.use(controller);
  app.use(dragManager);
  app.use(pasteManager);
  app.mount('body');
})();
