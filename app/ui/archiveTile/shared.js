// Pieces shared by more than one of the archive screens. Split out of a single
// 629-line archiveTile.js; the code is unchanged.
const html = require('choo/html');
const raw = require('choo/html/raw');
const assets = require('../../../common/assets');
const { bytes, list, timeLeft } = require('../../utils');

function expiryInfo(translate, archive) {
  const l10n = timeLeft(archive.expiresAt - Date.now());
  return raw(
    translate('archiveExpiryInfo', {
      downloadCount: translate('downloadCount', {
        num: archive.dlimit - archive.dtotal
      }),
      timespan: translate(l10n.id, l10n)
    })
  );
}

function fileInfo(file, action) {
  return html`
    <send-file class="flex flex-row items-center p-3 w-full">
      <svg class="h-8 w-8 text-primary">
        <use xlink:href="${assets.get('blue_file.svg')}#icon"/>
      </svg>
      <p class="ml-4 w-full">
        <h1 class="text-base font-medium word-break-all">${file.name}</h1>
        <div class="text-sm font-normal opacity-75 pt-1">${bytes(
          file.size
        )}</div>
      </p>
      ${action}
    </send-file>`;
}

function archiveInfo(archive, action) {
  return html`
    <p class="w-full flex items-center">
      <svg class="h-8 w-6 mr-3 flex-shrink-0 text-primary">
        <use xlink:href="${assets.get('blue_file.svg')}#icon"/>
      </svg>
      <p class="flex-grow">
        <h1 class="text-base font-medium word-break-all">${archive.name}</h1>
        <div class="text-sm font-normal opacity-75 pt-1">${bytes(
          archive.size
        )}</div>
      </p>
      ${action}
    </p>`;
}

function archiveDetails(translate, archive) {
  if (archive.manifest.files.length > 1) {
    return html`
      <details
        class="w-full pb-1"
        ${archive.open ? 'open' : ''}
        ontoggle="${toggled}"
      >
        <summary
          class="flex items-center link-primary text-sm cursor-pointer outline-none"
        >
          <svg
            class="fill-current w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"
            />
          </svg>
          ${translate('fileCount', {
            num: archive.manifest.files.length
          })}
        </summary>
        ${list(archive.manifest.files.map(f => fileInfo(f)))}
      </details>
    `;
  }
  function toggled(event) {
    event.stopPropagation();
    archive.open = event.target.open;
  }
}

module.exports = { expiryInfo, fileInfo, archiveInfo, archiveDetails };
