/*
  This code is included by both the server and frontend via
  common/assets.js

  When included from the server the export will be the function.

  When included from the frontend (via webpack) the export will
  be an object mapping file names to hashed file names. Example:
  "send_logo.svg": "send_logo.5fcfdf0e.svg"
*/

const fs = require('fs');
const path = require('path');

function kv(f) {
  // webpack 5 asset modules are ES modules, so a CommonJS require() of one
  // returns the namespace ({ default: url }). Take .default to keep the map
  // values plain URL strings (file-loader with esModule:false used to do this).
  return `"${f}": require('../assets/${f}').default`;
}

module.exports = function() {
  const files = fs.readdirSync(path.join(__dirname, '..', 'assets'));
  const code = `module.exports = {
    ${files.map(kv).join(',\n')}
  };`;
  return {
    code,
    dependencies: files.map(f => require.resolve('../assets/' + f)),
    cacheable: true
  };
};
