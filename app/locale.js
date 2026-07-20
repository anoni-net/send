import { FluentBundle, FluentResource } from '@fluent/bundle';

function makeBundle(locale, ftl) {
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(new FluentResource(ftl));
  return bundle;
}

export async function getTranslator(locale) {
  const bundles = [];
  const { default: en } = await import('../public/locales/en-US/send.ftl');
  if (locale !== 'en-US') {
    const { default: ftl } = await import(
      `../public/locales/${locale}/send.ftl`
    );
    bundles.push(makeBundle(locale, ftl));
  }
  bundles.push(makeBundle('en-US', en));
  return function(id, data) {
    for (let bundle of bundles) {
      if (bundle.hasMessage(id)) {
        return bundle.formatPattern(bundle.getMessage(id).value, data);
      }
    }
    // Falling off the end returned undefined, and nanohtml skips a non-string
    // child, so a missing key rendered as an empty element rather than anything
    // anyone would notice. That is how a reference to a string absent from all
    // 85 locales survived. Returning the id makes the gap visible.
    return id;
  };
}
