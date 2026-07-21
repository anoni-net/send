#!/usr/bin/env node

// Locale sanity check, run in CI as part of `npm run lint`.
//
// The previous `lint-locales` shelled out to `compare-locales`, a Python tool
// declared nowhere and never installed in this node-only CI, and it was named
// with a hyphen so `npm run lint`'s `lint:*` glob never picked it up. So it had
// not run in a long time, and two classes of drift accumulated unnoticed: a
// stray `}` left in en-US by a deleted message, and fourteen locale directories
// present but absent from `availableLanguages`.
//
// This replacement uses @fluent/syntax, whose parser reports malformed entries
// as Junk with annotations. @fluent/bundle (the runtime parser) cannot be used
// for this: it is deliberately resilient and silently drops junk, so a stray `}`
// leaves no trace in its output — checked, and it is why the old bug was
// invisible. It FAILS on the two things that must hold and REPORTS the two that
// are a maintainer's judgment.

const fs = require('fs');
const path = require('path');
const { parse } = require('@fluent/syntax');
const pkg = require('../package.json');

const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const REFERENCE = 'en-US';
// A served locale below this fraction of the reference shows English on some
// screens; surfaced so it is a decision, not a surprise. Not a gate: several
// shipping locales sit just above it today.
const COVERAGE_WARN = 0.75;

function parseLocale(locale) {
  const file = path.join(LOCALES_DIR, locale, 'send.ftl');
  const resource = parse(fs.readFileSync(file, 'utf8'), {});
  const junk = resource.body.filter(e => e.type === 'Junk');
  // Messages only: Terms (ids starting with `-`) are private helpers, not
  // user-facing strings, so they do not count toward coverage.
  const ids = resource.body
    .filter(e => e.type === 'Message')
    .map(e => e.id.name);
  return { junk, ids };
}

const dirs = fs
  .readdirSync(LOCALES_DIR)
  .filter(d => fs.existsSync(path.join(LOCALES_DIR, d, 'send.ftl')));
const served = pkg.availableLanguages;
const errors = [];

const refIds = new Set(parseLocale(REFERENCE).ids);

// FAIL 1: every locale file must parse cleanly. Junk is what a stray brace or a
// broken plural becomes, in any file, reference or not.
for (const locale of dirs) {
  const { junk } = parseLocale(locale);
  if (junk.length) {
    const where = junk
      .map(j => (j.annotations[0] ? j.annotations[0].message : 'malformed'))
      .join('; ');
    errors.push(`${locale}: ${junk.length} malformed entry/entries (${where})`);
  }
}

// FAIL 2: every served locale must have a directory to serve.
for (const locale of served) {
  if (!dirs.includes(locale)) {
    errors.push(
      `${locale} is in availableLanguages but has no public/locales/${locale}/send.ftl`
    );
  }
}

// REPORT 1: directories not served. Kept in the repo, never sent to a browser.
// Promoting one means backfilling it and adding it to availableLanguages;
// removing it means deleting the directory. Either is fine; drifting is what is
// not.
const unserved = dirs.filter(d => d !== REFERENCE && !served.includes(d));
if (unserved.length) {
  console.log(
    `note: ${unserved.length} locale(s) present but not served (not in ` +
      `availableLanguages): ${unserved.join(', ')}`
  );
}

// REPORT 2: served locales well below the reference. These render English on
// some screens, including the home page for the worst of them.
const thin = [];
for (const locale of served) {
  if (locale === REFERENCE || !dirs.includes(locale)) continue;
  const covered = parseLocale(locale).ids.filter(id => refIds.has(id)).length;
  if (covered / refIds.size < COVERAGE_WARN) {
    thin.push(`${locale} ${covered}/${refIds.size}`);
  }
}
if (thin.length) {
  console.log(
    `note: ${thin.length} served locale(s) below ` +
      `${Math.round(COVERAGE_WARN * 100)}% of ${REFERENCE}: ${thin.join(', ')}`
  );
}

if (errors.length) {
  console.error('locale check failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `locale check: ${dirs.length} locale file(s) parse cleanly; ` +
    `${served.length} served, all present.`
);
