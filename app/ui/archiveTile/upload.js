const html = require('choo/html');
const assets = require('../../../common/assets');
const raw = require('choo/html/raw');
const { bytes, percent } = require('../../utils');
const { expiryInfo, archiveInfo } = require('./shared');

module.exports.uploading = function(state, emit) {
  const progress = state.transfer.progressRatio;
  const progressPercent = percent(progress);
  const archive = state.archive;
  return html`
    <send-upload-area
      id="${archive.id}"
      class="flex flex-col items-start rounded-default shadow-light bg-white p-4 w-full dark:bg-grey-90"
    >
      ${archiveInfo(archive)}
      <div class="text-xs opacity-75 w-full mt-2 mb-2">
        ${expiryInfo(state.translate, {
          dlimit: state.archive.dlimit,
          dtotal: 0,
          expiresAt: Date.now() + 500 + state.archive.timeLimit * 1000
        })}
      </div>
      <div class="link-primary text-sm font-medium mt-2">
        ${progressPercent}
      </div>
      <progress class="my-3" value="${progress}">${progressPercent}</progress>
      <button
        class="link-primary self-end font-medium"
        onclick=${cancel}
        title="${state.translate('deletePopupCancel')}"
      >
        ${state.translate('deletePopupCancel')}
      </button>
    </send-upload-area>
  `;

  function cancel(event) {
    event.stopPropagation();
    event.target.disabled = true;
    emit('cancel');
  }
};

module.exports.empty = function(state, emit) {
  const uploadNotice = state.WEB_UI.UPLOAD_AREA_NOTICE_HTML
    ? html`
        <p
          class="w-full mt-8 p-2 border-default dark:border-grey-70 rounded-default text-orange-60 bg-yellow-40 text-center leading-normal"
        >
          ${raw(state.WEB_UI.UPLOAD_AREA_NOTICE_HTML)}
        </p>
      `
    : '';

  return html`
    <send-upload-area
      class="flex flex-col items-center justify-center border-2 border-dashed border-grey-transparent rounded-default px-6 py-16 h-full w-full dark:border-grey-60"
      onclick="${e => {
        if (e.target.tagName !== 'LABEL') {
          document.getElementById('file-upload').click();
        }
      }}"
    >
      <svg class="w-10 h-10 link-primary">
        <use xlink:href="${assets.get('addfiles.svg')}#plus" />
      </svg>
      <div class="pt-6 pb-2 text-center text-lg font-bold tracking-wide">
        ${state.translate('dragAndDropFiles')}
      </div>
      <div class="pb-6 text-center text-base">
        ${state.translate('orClickWithSize', {
          size: bytes(state.LIMITS.MAX_FILE_SIZE)
        })}
      </div>
      <input
        id="file-upload"
        class="opacity-0 w-0 h-0 appearance-none absolute overflow-hidden"
        type="file"
        multiple
        onfocus="${focus}"
        onblur="${blur}"
        onchange="${add}"
        onclick="${e => e.stopPropagation()}"
      />
      <label
        for="file-upload"
        role="button"
        class="btn rounded-lg flex items-center mt-4"
        title="${state.translate('addFilesButton', {
          size: bytes(state.LIMITS.MAX_FILE_SIZE)
        })}"
      >
        ${state.translate('addFilesButton')}
      </label>
      ${uploadNotice}
    </send-upload-area>
  `;

  function focus(event) {
    event.target.nextElementSibling.classList.add('bg-primary', 'outline');
  }

  function blur(event) {
    event.target.nextElementSibling.classList.remove('bg-primary', 'outline');
  }

  function add(event) {
    event.preventDefault();
    const newFiles = Array.from(event.target.files);

    emit('addFiles', { files: newFiles });
  }
};
