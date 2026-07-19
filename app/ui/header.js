const html = require('nanohtml');
const assets = require('../../common/assets');
const { platform } = require('../utils');

// See the note in footer.js: this was a nanocomponent whose update() returned
// false, and the cache is scoped to `state` so the server cannot leak one
// request's assets and language into the next.
module.exports = function header(state) {
  if (!state._headerElement) {
    state._headerElement = createHeader(state);
  }
  return state._headerElement;
};

function createHeader(state) {
  let assetMap;
  if (state.ui !== undefined) assetMap = state.ui.assets;
  else
    assetMap = {
      icon:
        state.WEB_UI.CUSTOM_ASSETS.icon !== ''
          ? state.WEB_UI.CUSTOM_ASSETS.icon
          : assets.get('icon.svg'),
      wordmark:
        state.WEB_UI.CUSTOM_ASSETS.wordmark !== ''
          ? state.WEB_UI.CUSTOM_ASSETS.wordmark
          : assets.get('wordmark.svg') + '#logo'
    };
  const title =
    platform() === 'android'
      ? html`
          <a class="flex flex-row items-center">
            <img src="${assetMap.icon}" />
            <svg class="w-48">
              <use xlink:href="${assetMap.wordmark}" />
            </svg>
          </a>
        `
      : html`
          <a class="flex flex-row items-center" href="/">
            <img alt="${state.translate('title')}" src="${assetMap.icon}" />
            <svg viewBox="66 0 340 64" class="w-48 md:w-64">
              <use xlink:href="${assetMap.wordmark}" />
            </svg>
          </a>
        `;
  return html`
    <header
      class="main-header relative flex-none flex flex-row items-center justify-between w-full px-6 md:px-8 h-16 md:h-24 z-20 bg-transparent"
    >
      ${title}
    </header>
  `;
}
