const html = require('nanohtml');
const raw = require('nanohtml/raw');
const { percent } = require('../../utils');
const { archiveInfo, archiveDetails } = require('./shared');

module.exports.preview = function(state, emit) {
  const archive = state.fileInfo;
  if (archive.open === undefined) {
    archive.open = true;
  }
  const single = archive.manifest.files.length === 1;
  const details = single
    ? ''
    : html`
        <div class="mt-4 h-full md:h-48 overflow-y-auto">
          ${archiveDetails(state.translate, archive)}
        </div>
      `;
  const notice = state.WEB_UI.DOWNLOAD_NOTICE_HTML
    ? html`
        <p
          class="w-full mt-4 p-2 border-default dark:border-grey-70 rounded-default text-orange-60 bg-yellow-40 text-center leading-normal"
        >
          ${raw(state.WEB_UI.DOWNLOAD_NOTICE_HTML)}
        </p>
      `
    : '';
  return html`
    <send-archive
      class="flex flex-col max-h-full bg-white p-4 w-full md:w-128 dark:bg-grey-90"
    >
      <div class="border-default rounded-default py-3 px-6 dark:border-grey-70">
        ${archiveInfo(archive)} ${details}
      </div>
      <button
        id="download-btn"
        class="btn rounded-lg mt-4 w-full flex-shrink-0 focus:outline"
        title="${state.translate('downloadButtonLabel')}"
        onclick=${download}
      >
        ${state.translate('downloadButtonLabel')}
      </button>
      ${notice}
    </send-archive>
  `;

  function download(event) {
    event.preventDefault();
    event.target.disabled = true;
    emit('download');
  }
};

module.exports.downloading = function(state) {
  const archive = state.fileInfo;
  const progress = state.transfer.progressRatio;
  const progressPercent = percent(progress);
  return html`
    <send-archive
      class="flex flex-col bg-white rounded-default shadow-light p-4 w-full max-w-sm md:w-128 dark:bg-grey-90"
    >
      ${archiveInfo(archive)}
      <div class="link-primary text-sm font-medium mt-2">
        ${progressPercent}
      </div>
      <progress class="my-3" value="${progress}">${progressPercent}</progress>
    </send-archive>
  `;
};
