/* eslint-disable no-undef, no-process-exit */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const webpack = require('webpack');
const config = require('../../webpack.config');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const devRoutes = require('../../server/bin/test');
const app = express();

// webpack-dev-middleware v7 holds requests until the bundle is compiled, so the
// page load below waits for the build. (The /test bundle needs FRONTEND_TESTS=1.)
const wpm = middleware(webpack(config(null, { mode: 'development' })));
app.use(wpm);
devRoutes(app, { middleware: wpm });

const server = app.listen(async function() {
  let exitCode = -1;
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log(e));
    page.setDefaultNavigationTimeout(60000);
    await page.goto(`http://127.0.0.1:${server.address().port}/test`);
    // mocha sets window.runner = mocha.run(); the JSON reporter fills testResults.
    await page.waitForFunction(
      () =>
        typeof runner !== 'undefined' &&
        typeof runner.testResults !== 'undefined',
      null,
      { polling: 1000, timeout: 30000 }
    );
    const results = await page.evaluate(() => runner.testResults);
    const coverage = await page.evaluate(() =>
      typeof __coverage__ !== 'undefined' ? __coverage__ : null
    );
    if (coverage) {
      const dir = path.resolve(__dirname, '../../.nyc_output');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.resolve(dir, 'frontend.json'),
        JSON.stringify(coverage)
      );
    }
    const stats = results.stats;
    exitCode = stats.failures;
    console.log(`${stats.passes} passing (${stats.duration}ms)\n`);
    if (stats.failures) {
      console.log('Failures:\n');
      for (const f of results.failures) {
        console.log(`${f.fullTitle}`);
        console.log(` ${f.err.stack}\n`);
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
    server.close(() => process.exit(exitCode));
  }
});
