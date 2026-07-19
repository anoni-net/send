const html = require('nanohtml');

// Was a nanocomponent class whose update() returned false. That contract is
// "create the element on first render, hand back the same node afterwards",
// which is what this does directly. nanomorph skips any node where
// newNode.isSameNode(oldNode) holds, and a DOM node is always the same node as
// itself, so returning the cached element is exactly what nanocomponent's proxy
// element bought us.
//
// The cache lives on `state`, never at module scope. The server builds a fresh
// state per request, so a module-level cache would render the footer once and
// then serve that first visitor's language to everyone after them.
module.exports = function footer(state) {
  if (!state._footerElement) {
    state._footerElement = createFooter(state);
  }
  return state._footerElement;
};

function createFooter(state) {
  const translate = state.translate;

  // Add additional links from configuration if available
  const links = [];
  if (state != undefined && state.WEB_UI != undefined) {
    const WEB_UI = state.WEB_UI;

    if (WEB_UI.FOOTER_DONATE_URL != '') {
      links.push(html`
        <li class="m-2">
          <a href="${WEB_UI.FOOTER_DONATE_URL}" target="_blank">
            ${translate('footerLinkDonate')}
          </a>
        </li>
      `);
    }
    if (WEB_UI.FOOTER_CLI_URL != '') {
      links.push(html`
        <li class="m-2">
          <a href="${WEB_UI.FOOTER_CLI_URL}" target="_blank">
            ${translate('footerLinkCli')}
          </a>
        </li>
      `);
    }
    if (WEB_UI.FOOTER_DMCA_URL != '') {
      links.push(html`
        <li class="m-2">
          <a href="${WEB_UI.FOOTER_DMCA_URL}" target="_blank">
            ${translate('footerLinkDmca')}
          </a>
        </li>
      `);
    }
    if (WEB_UI.FOOTER_SOURCE_URL != '') {
      links.push(html`
        <li class="m-2">
          <a href="${WEB_UI.FOOTER_SOURCE_URL}" target="_blank">
            ${translate('footerLinkSource')}
          </a>
        </li>
      `);
    }
  } else {
    links.push(html`
      <li class="m-2">
        <a href="https://github.com/anoni-net/send" target="_blank">
          ${translate('footerLinkSource')}
        </a>
      </li>
    `);
  }

  // Defining a custom footer
  const footerLinks = [];
  if (state != undefined && state.WEB_UI != undefined) {
    const WEB_UI = state.WEB_UI;

    if (WEB_UI.CUSTOM_FOOTER_URL != '' && WEB_UI.CUSTOM_FOOTER_TEXT != '') {
      footerLinks.push(html`
        <li class="m-2">
          <a href="${WEB_UI.CUSTOM_FOOTER_URL}" target="_blank">
            ${WEB_UI.CUSTOM_FOOTER_TEXT}
          </a>
        </li>
      `);
    } else if (WEB_UI.CUSTOM_FOOTER_URL != '') {
      footerLinks.push(html`
        <li class="m-2">
          <a href="${WEB_UI.CUSTOM_FOOTER_URL}" target="_blank">
            ${WEB_UI.CUSTOM_FOOTER_URL}
          </a>
        </li>
      `);
    } else if (WEB_UI.CUSTOM_FOOTER_TEXT != '') {
      footerLinks.push(html`
        <li class="m-2">
          ${WEB_UI.CUSTOM_FOOTER_TEXT}
        </li>
      `);
    } else {
      footerLinks.push(html`
        <li class="m-2">
          ${translate('footerText')}
        </li>
      `);
    }
  }

  return html`
    <footer
      class="flex flex-col md:flex-row items-start w-full flex-none self-start p-6 md:p-8 font-medium text-xs text-grey-60 dark:text-grey-40 md:items-center justify-between"
    >
      <ul
        class="flex flex-col md:flex-row items-start md:items-center md:justify-start"
      >
        ${footerLinks}
      </ul>
      <ul
        class="flex flex-col md:flex-row items-start md:items-center md:justify-end"
      >
        ${links}
      </ul>
    </footer>
  `;
}
