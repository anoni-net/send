const html = require('nanohtml');
const raw = require('nanohtml/raw');
const { secondsToL10nId } = require('../utils');
const selectbox = require('./selectbox');

module.exports = function(state, emit) {
  const el = html`
    <div class="px-1">
      ${raw(
        state.translate('archiveExpiryInfo', {
          downloadCount:
            '<span class="lg:inline-block md:block sm:inline-block block"></span><select id="dlCount"></select>',
          timespan: '<select id="timespan"></select>'
        })
      )}
    </div>
  `;
  if (el.__encoded) {
    // we're rendering on the server
    return el;
  }

  const counts = state.DEFAULTS.DOWNLOAD_COUNTS.filter(
    i => i <= state.LIMITS.MAX_DOWNLOADS
  );

  const dlCountSelect = el.querySelector('#dlCount');
  el.replaceChild(
    selectbox(
      state.archive.dlimit,
      counts,
      num => state.translate('downloadCount', { num }),
      value => {
        const selected = parseInt(value);
        state.archive.dlimit = selected;
        emit('render');
      },
      'expire-after-dl-count-select',
      state.translate('downloadCountSelectLabel')
    ),
    dlCountSelect
  );

  const expires = state.DEFAULTS.EXPIRE_TIMES_SECONDS.filter(
    i => i <= state.LIMITS.MAX_EXPIRE_SECONDS
  );

  const timeSelect = el.querySelector('#timespan');
  el.replaceChild(
    selectbox(
      state.archive.timeLimit,
      expires,
      num => {
        const l10n = secondsToL10nId(num);
        return state.translate(l10n.id, l10n);
      },
      value => {
        const selected = parseInt(value);
        state.archive.timeLimit = selected;
        emit('render');
      },
      'expire-after-time-select',
      state.translate('expiryTimeSelectLabel')
    ),
    timeSelect
  );

  return el;
};
