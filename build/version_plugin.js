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
  // Our own release, from package.json. Use this for anything that identifies
  // the build rather than the protocol, such as support questions.
  release: process.env.CIRCLE_TAG || `v${pkg.version}`
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
