const fs = require('fs');
const path = require('path');
const { FluentBundle, FluentResource } = require('@fluent/bundle');
const localesPath = path.resolve(__dirname, '../public/locales');
const locales = fs.readdirSync(localesPath);

function makeBundle(locale) {
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(
    new FluentResource(
      fs.readFileSync(path.resolve(localesPath, locale, 'send.ftl'), 'utf8')
    )
  );
  return [locale, bundle];
}

const bundles = new Map(locales.map(makeBundle));

module.exports = function getTranslator(locale) {
  const defaultBundle = bundles.get('en-US');
  const bundle = bundles.get(locale) || defaultBundle;
  return function(id, data) {
    if (bundle.hasMessage(id)) {
      return bundle.formatPattern(bundle.getMessage(id).value, data);
    }
    if (defaultBundle.hasMessage(id)) {
      return defaultBundle.formatPattern(
        defaultBundle.getMessage(id).value,
        data
      );
    }
    // Unguarded, this was `defaultBundle.getMessage(id).value` on an undefined
    // message: a TypeError thrown while rendering, so one missing key 500s the
    // page. Returning the id keeps the page up and makes the gap visible, which
    // is how a missing key should fail. The client does the same.
    return id;
  };
};
