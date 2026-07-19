# Localization

Send carries translations for more than 80 languages, inherited from the years it
was run by Mozilla. We use the [fluent](https://projectfluent.org/) library and
store the translations in [FTL](https://projectfluent.org/fluent/guide/) files
under `public/locales/`. `en-US` is the base language.

## Process

Strings are added to or removed from `public/locales/en-US/send.ftl` as needed. A
string **MUST NOT** be *changed* once it has been committed. Changing what a
string means requires a new ID with a new name, descriptive rather than
incremented, plus deletion of the obsolete ID. Translators have already
translated the old ID, and editing it in place would leave every other language
saying something the English no longer says. A comment above the string
explaining where it is used is usually worth writing.

The translations were originally maintained in Mozilla's Pontoon instance, which
no longer feeds this repository. Corrections and new languages now arrive as pull
requests against `public/locales/` like any other change.

### Activation

The development environment includes every locale in `public/locales` via the
`L10N_DEV` environment variable. Production serves the list in `package.json`
instead, so a locale becomes visible to visitors once it has enough string
coverage and is added there. Two scripts help with that: `npm run lint-locales`
reports missing strings and errors, and `npm run get-prod-locales` lists the
locales complete enough to promote. Both shell out to Mozilla's
[compare-locales](https://pypi.org/project/compare-locales/), so install it
first.

## Code

In `app/` we use the `state.translate()` function to translate strings to the best matching language base on the user's `Accept-Language` header. It's a wrapper around fluent's [FluentBundle.format](http://projectfluent.org/fluent.js/fluent/FluentBundle.html). It works the same for both server and client side rendering.

### Examples

```js
// simple string
const finishedString = state.translate('downloadFinish')
// with parameters
const progressString = state.translate('downloadingPageProgress', {
  filename: state.fileInfo.name,
  size: bytes(state.fileInfo.size)
})
```
