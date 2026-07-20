const html = require('nanohtml');
const modal = require('./modal');

module.exports = function(state, emit) {
  let strings;
  // `why` keeps its initialiser: the outdated branch below does not set it.
  let why = '';

  // No outbound link to any particular browser vendor. Send is not affiliated
  // with one, README and the footer both say so, and telling a Tor Browser user
  // to install something else is bad advice for exactly the people most likely
  // to be reading this page.
  if (state.params.reason === 'insecure') {
    strings = insecureStrings(state);
  } else if (state.params.reason === 'outdated') {
    strings = outdatedStrings(state);
  } else {
    strings = unsupportedStrings(state);
    why = html`
      <a
        class="text-primary"
        href="https://github.com/anoni-net/send/blob/main/docs/faq.md#why-is-my-browser-not-supported"
      >
        ${state.translate('notSupportedLink')}
      </a>
    `;
  }

  return html`
    <main class="main">
      ${state.modal && modal(state, emit)}
      <section
        class="flex flex-col items-center justify-center text-center bg-white m-6 px-6 py-8 border-default border-grey-30 md:border-none md:px-12 md:py-16 shadow-default w-full md:h-full dark:bg-grey-90"
      >
        <h1 class="text-3xl font-bold">${strings.header}</h1>
        <p class="mt-4 mb-8 max-w-md leading-normal">${strings.description}</p>
        ${why}
      </section>
    </main>
  `;
};

function outdatedStrings(state) {
  return {
    header: state.translate('notSupportedHeader'),
    description: state.translate('notSupportedUpdateDetail')
  };
}

function unsupportedStrings(state) {
  return {
    header: state.translate('notSupportedHeader'),
    description: state.translate('notSupportedDetail')
  };
}

// Not the browser's fault. WebCrypto is unavailable on any origin the browser
// does not consider secure, so an operator serving Send over plain http sends
// every visitor to this page. Blaming their browser sends them off to
// troubleshoot something that is not broken.
function insecureStrings(state) {
  return {
    header: state.translate('insecureContextHeader'),
    description: state.translate('insecureContextDetail')
  };
}
