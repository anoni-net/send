const html = require('nanohtml');
const raw = require('nanohtml/raw');

module.exports = function intro(state) {
  const notice = state.WEB_UI.MAIN_NOTICE_HTML
    ? html`
        <p
          class="w-full mt-2 p-2 border-default dark:border-grey-70 rounded-default text-orange-60 bg-yellow-40 text-center leading-normal"
        >
          ${raw(state.WEB_UI.MAIN_NOTICE_HTML)}
        </p>
      `
    : '';

  return html`
    <send-intro
      class="flex flex-col items-center justify-center bg-white px-6 md:py-0 py-6 mb-0 h-full w-full dark:bg-grey-90"
    >
      ${notice}
      <div class="mt-12 flex flex-col h-full">
        <h1 class="text-3xl font-bold md:pb-2">
          ${state.translate('introTitle')}
        </h1>
        <p class="max-w-sm leading-loose mt-6 md:mt-2 md:pr-14">
          ${state.translate('introDescription')}
        </p>
      </div>
    </send-intro>
  `;
};
