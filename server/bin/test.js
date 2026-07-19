const assets = require('../../common/assets');
const routes = require('../routes');
const pages = require('../routes/pages');
const tests = require('../../test/frontend/routes');
const expressWs = require('express-ws');

module.exports = function(app, devServer) {
  assets.setMiddleware(devServer.middleware);
  // see the note in prod.js
  expressWs(app, null, {
    wsOptions: { perMessageDeflate: false, maxPayload: 1024 * 1024 }
  });
  routes(app);
  app.ws('/api/ws', require('../routes/ws'));
  tests(app);
  // webpack-dev-server routes haven't been added yet
  // so wait for next tick to add 404 handler
  process.nextTick(() => app.use(pages.notfound));
};
