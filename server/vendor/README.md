# Vendored data

## cldr-likelySubtags.json

`supplemental/likelySubtags.json` from [cldr-core](https://www.npmjs.com/package/cldr-core)
**35.1.0**, copied verbatim. `server/middleware/language.js` reads only
`.supplemental.likelySubtags` from it, to expand an `Accept-Language` value like
`zh` to a fully-qualified locale.

The whole `cldr-core` package is 1.2 MB for this one 52 KB file, all of it a
production dependency that shipped in the image. Vendoring the file drops the
dependency. The data is a stable mapping table; refresh it from a newer
`cldr-core` if the served locale set grows to something it does not cover.
