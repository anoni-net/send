#!/usr/bin/env node

// Fails when a version a reader is meant to copy and run has drifted from
// package.json.
//
// The docs carry the current release in eighteen places: image tags, a cosign
// invocation, `git checkout`, a sample /__version__ body. Bumping the version
// means editing all of them, and missing one is silent. A stale `cosign verify
// ghcr.io/anoni-net/send:4.0.0` does not look wrong, it just verifies the wrong
// thing, and the reader has no way to tell.
//
// Only command-shaped references are checked. Prose that names an older release
// on purpose ("Since v4.0.0 our version numbers no longer track upstream's")
// carries no version in any of these shapes, so it needs no exemption list to
// maintain, which is the point: an exemption list is another thing that goes
// stale.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const expected = require(path.join(root, 'package.json')).version;

// Each pattern captures the version in group 1. `v` is optional throughout
// because the git tag and the `release` field carry it while the image tag does
// not.
const PATTERNS = [
  // ghcr.io/anoni-net/send:5.0.0
  { name: 'image tag', re: /ghcr\.io\/anoni-net\/send:v?(\d+\.\d+\.\d+)/g },
  // VERSION=v5.0.0
  { name: 'VERSION assignment', re: /VERSION=v?(\d+\.\d+\.\d+)/g },
  // git checkout v5.0.0 / git tag -v v5.0.0
  { name: 'git command', re: /git (?:checkout|tag -v) v?(\d+\.\d+\.\d+)/g },
  // "release":"v5.0.0" in a sample /__version__ response
  { name: 'release field', re: /"release"\s*:\s*"v?(\d+\.\d+\.\d+)"/g },
  // `:5.0.0` as an inline-code tag reference, e.g. in a table of tag forms
  { name: 'inline tag', re: /`:v?(\d+\.\d+\.\d+)`/g }
];

// CHANGELOG is excluded deliberately: every past release is supposed to be in
// it. Same for node_modules and the build output.
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);
const SKIP_FILES = new Set(['CHANGELOG.md']);

function markdownFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      markdownFiles(full, out);
    } else if (entry.name.endsWith('.md') && !SKIP_FILES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const problems = [];
let checked = 0;

for (const file of markdownFiles(root)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        checked += 1;
        if (m[1] !== expected) {
          problems.push({
            file: path.relative(root, file),
            line: i + 1,
            name,
            found: m[1],
            text: line.trim()
          });
        }
      }
    }
  });
}

if (problems.length > 0) {
  console.error(
    `package.json is ${expected}, but ${problems.length} reference(s) in the docs disagree:\n`
  );
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  (${p.name}: ${p.found})`);
    console.error(`    ${p.text}`);
  }
  console.error(
    '\nUpdate them, or if one names an older release on purpose, write it in a' +
      '\nform that is not a runnable command.'
  );
  process.exit(1);
}

console.log(
  `docs version check: ${checked} reference(s) across the docs all say ${expected}`
);
