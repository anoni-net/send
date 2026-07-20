const gitRevSync = require('git-rev-sync');
const pkg = require('../package.json');

let commit = 'unknown';

try {
  commit = gitRevSync.short();
} catch (e) {
  console.warn('Error fetching current git commit: ' + e);
}

// The Send API generation this server speaks, which is NOT our release number.
// Third-party clients gate on it: ffsend maps `>=3.0 <4.0` to its V3 API and
// has no fallback, so reporting our own `4.x` here makes every ffsend user fail
// with "unsupported version". We have changed no protocol, URL format or
// crypto since upstream v3.4.27, so that is what we keep advertising. Bump it
// only when the wire protocol actually changes.
const API_VERSION = 'v3.4.27';

const version = JSON.stringify({
  commit,
  source: pkg.homepage,
  version: API_VERSION,
  // Our own release. Use this for anything that identifies the build rather
  // than the protocol, such as support questions or fetching the matching
  // SHA256SUMS.txt.
  //
  // Read from package.json and from nothing else. This used to fall back from
  // process.env.CIRCLE_TAG, left over from Mozilla's CircleCI: GitHub Actions
  // never sets that variable, so the fallback had been dead for as long as this
  // repository has existed. Reaching for the CI equivalent (GITHUB_REF_NAME)
  // would have been the wrong repair. version.json ships inside dist/, and
  // VERIFYING.md promises that a clean clone plus `npm ci && npm run build`
  // reproduces dist/ byte for byte. Anything sourced from the build environment
  // rather than the tree breaks that promise the moment the two disagree, and
  // it fails in the least helpful way: an auditor's honest rebuild stops
  // matching, and the tooling cannot tell them whether they found tampering or
  // a version string. The tree is the single source, and the publish workflow
  // checks the git tag against it.
  release: `v${pkg.version}`
});

class VersionPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('VersionPlugin', compilation => {
      compilation.assets['version.json'] = {
        source() {
          return version;
        },
        size() {
          return version.length;
        }
      };
    });
  }
}

module.exports = VersionPlugin;
