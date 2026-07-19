/* global Android */

// Split from a single 629-line file. Callers still do require('./archiveTile')
// and reach the screens as named properties, so no call site changed.
const html = require('nanohtml');
const assets = require('../../../common/assets');
const { copyToClipboard, platform } = require('../../utils');
const { expiryInfo, archiveInfo, archiveDetails } = require('./shared');

module.exports = function(state, emit, archive) {
  const copyOrShare =
    state.capabilities.share || platform() === 'android'
      ? html`
          <button
            class="link-primary self-end flex items-start"
            onclick=${share}
            title="Share link"
          >
            <svg class="h-4 w-4 mr-2">
              <use xlink:href="${assets.get('share-24.svg')}#icon" />
            </svg>
            Share link
          </button>
        `
      : html`
          <button
            class="link-primary focus:outline self-end flex items-center"
            onclick=${copy}
            title="${state.translate('copyLinkButton')}"
          >
            <svg class="h-4 w-4 mr-2">
              <use xlink:href="${assets.get('copy-16.svg')}#icon" />
            </svg>
            ${state.translate('copyLinkButton')}
          </button>
        `;
  const dl =
    platform() === 'web'
      ? html`
          <a
            class="flex items-baseline link-primary"
            href="${archive.url}"
            title="${state.translate('downloadButtonLabel')}"
            tabindex="0"
          >
            <svg class="h-4 w-3 mr-2">
              <use xlink:href="${assets.get('dl.svg')}#icon" />
            </svg>
            ${state.translate('downloadButtonLabel')}
          </a>
        `
      : html`
          <div></div>
        `;
  return html`
    <send-archive
      id="archive-${archive.id}"
      class="flex flex-col items-start rounded-default shadow-light bg-white p-4 w-full dark:bg-grey-90 dark:border-default dark:border-grey-70"
    >
      ${archiveInfo(
        archive,
        html`
          <input
            type="image"
            class="self-start flex-shrink-0 text-white hover:opacity-75 focus:outline"
            alt="${state.translate('deleteButtonHover')}"
            title="${state.translate('deleteButtonHover')}"
            src="${assets.get('close-16.svg')}"
            onclick=${del}
          />
        `
      )}
      <div class="text-sm opacity-75 w-full mt-2 mb-2">
        ${expiryInfo(state.translate, archive)}
      </div>
      ${archiveDetails(state.translate, archive)}
      <hr class="w-full border-t my-4 dark:border-grey-70" />
      <div class="flex justify-between w-full">
        ${dl} ${copyOrShare}
      </div>
    </send-archive>
  `;

  function copy(event) {
    event.stopPropagation();
    copyToClipboard(archive.url);
    const text = event.target.lastChild;
    text.textContent = state.translate('copiedUrl');
    setTimeout(
      () => (text.textContent = state.translate('copyLinkButton')),
      1000
    );
  }

  function del(event) {
    event.stopPropagation();
    emit('delete', archive);
  }

  async function share(event) {
    event.stopPropagation();
    if (platform() === 'android') {
      Android.shareUrl(archive.url);
    } else {
      try {
        await navigator.share({
          title: state.translate('-send-brand'),
          text: `Download "${archive.name}" with Send: simple, safe file sharing`,
          //state.translate('shareMessage', { name }),
          url: archive.url
        });
      } catch (e) {
        // ignore
      }
    }
  }
};

module.exports.wip = require('./wip');
module.exports.uploading = require('./upload').uploading;
module.exports.empty = require('./upload').empty;
module.exports.preview = require('./download').preview;
module.exports.downloading = require('./download').downloading;
