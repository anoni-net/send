const html = require('nanohtml');

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// <send-modal> is registered as a custom element so it can manage focus, which
// a plain template cannot: the dialog used to appear with keyboard focus left
// on the now-obscured page behind it, no way to Escape, and no dialog role for
// assistive tech. Guarded because this module is imported during server-side
// rendering too, where customElements does not exist.
if (typeof customElements !== 'undefined' && !customElements.get('send-modal')) {
  customElements.define(
    'send-modal',
    class extends HTMLElement {
      connectedCallback() {
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', 'true');
        this.tabIndex = -1;
        // Where focus was, so it can go back when the dialog closes.
        this._returnFocus =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const first = this.querySelector(FOCUSABLE) || this;
        first.focus();
        this._onKeydown = e => this.onKeydown(e);
        this.addEventListener('keydown', this._onKeydown);
      }

      disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeydown);
        if (this._returnFocus && document.contains(this._returnFocus)) {
          this._returnFocus.focus();
        }
      }

      onKeydown(e) {
        if (e.key === 'Escape') {
          // Dismiss the way the button does, so a dialog with an onclose (the
          // rate-limited download reloads on dismiss) runs it. The last control
          // is the OK/close button in every dialog here.
          const buttons = this.querySelectorAll('button, input[type="submit"]');
          const dismiss = buttons[buttons.length - 1];
          if (dismiss) {
            dismiss.click();
          }
          return;
        }
        if (e.key !== 'Tab') {
          return;
        }
        // Keep Tab inside the dialog.
        const focusable = Array.from(this.querySelectorAll(FOCUSABLE)).filter(
          el => el.offsetParent !== null
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  );
}

module.exports = function(state, emit) {
  return html`
    <send-modal
      class="absolute inset-0 flex items-center justify-center overflow-hidden z-40 bg-white md:rounded-xl md:my-8 dark:bg-grey-90"
    >
      <div
        class="h-full w-full max-h-screen absolute top-0 flex justify-center md:items-center"
      >
        <div class="w-full">
          ${state.modal(state, emit, close)}
        </div>
      </div>
    </send-modal>
  `;

  function close(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    emit('closeModal');
  }
};
