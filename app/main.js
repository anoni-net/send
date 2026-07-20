/* global DEFAULTS LIMITS WEB_UI */
import 'core-js';
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

  /* eslint-disable-next-line require-atomic-updates --
     same bootstrap, single pass, no concurrent writer. */
  window.app = app;
  app.use(controller);
  app.use(dragManager);
  app.use(pasteManager);
  app.mount('body');
})();
