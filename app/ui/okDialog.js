const html = require('nanohtml');

// `onclose` is optional. It exists for dialogs that leave the page with nothing
// useful behind them: on the download page a failed metadata request means
// there is no file to render, so dismissing the dialog would drop the visitor
// on a blank page with no way forward.
module.exports = function(message, onclose) {
  return function(state, emit, closeModal) {
    const close = event => {
      closeModal(event);
      if (onclose) {
        onclose();
      }
    };
    return html`
      <send-ok-dialog class="flex flex-col max-w-sm p-4 m-auto">
        <h2 class="text-center text-xl font-bold m-8 leading-normal">
          ${message}
        </h2>
        <button
          class="btn rounded-lg w-full flex-shrink-0"
          onclick="${close}"
          title="${state.translate('okButton')}"
        >
          ${state.translate('okButton')}
        </button>
      </send-ok-dialog>
    `;
  };
};
