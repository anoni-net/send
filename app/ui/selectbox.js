const html = require('nanohtml');

// `label` names the control for assistive tech. The two expiry selects sit
// inside a run-on sentence with no <label> of their own, so without it a screen
// reader announces two unnamed comboboxes, and these are the controls that set
// how long the file stays on the server.
module.exports = function(selected, options, translate, changed, htmlId, label) {
  function choose(event) {
    if (event.target.value != selected) {
      changed(event.target.value);
    }
  }

  return html`
    <select
      id="${htmlId}"
      aria-label="${label || ''}"
      class="appearance-none cursor-pointer border-default rounded-default bg-grey-10 hover:border-primary focus:border-primary pl-1 pr-8 py-1 my-1 h-8 dark:bg-grey-80"
      data-selected="${selected}"
      onchange="${choose}"
    >
      ${options.map(
        value =>
          html`
            <option value="${value}" ${value == selected ? 'selected' : ''}>
              ${translate(value)}
            </option>
          `
      )}
    </select>
  `;
};
