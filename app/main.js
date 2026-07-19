/* global DEFAULTS LIMITS WEB_UI PREFS */
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
  if (
    !capabilities.crypto &&
    window.location.pathname !== '/unsupported/crypto'
  ) {
    return window.location.assign('/unsupported/crypto');
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
    PREFS,
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
