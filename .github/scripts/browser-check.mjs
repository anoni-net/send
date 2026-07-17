// Headless browser regression check for the built Send image.
//
// Loads the home page in real chromium, waits for the client (choo) app to
// render, and asserts there are no broken or unresolved assets. This catches
// client-side regressions the curl-based smoke test cannot see, because the
// server-rendered HTML can be correct while the hydrated app is broken:
//   - webpack 5 publicPath:'auto' -> /auto/app.<hash>.js 404 -> blank page
//   - asset-map interop bug        -> <img src="undefined"> (missing logo)
//
// Usage: node browser-check.mjs [url]   (default http://localhost:1443/)

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:1443/';
const origin = new URL(url).origin;

const browser = await chromium.launch();
const page = await browser.newPage();

// Record same-origin responses that failed (a bad publicPath / undefined asset
// shows up here as a 4xx from this host). Cross-origin failures are ignored so
// pre-existing external <use> references don't fail the check.
const sameOrigin4xx = [];
page.on('response', r => {
  if (r.status() >= 400 && r.url().startsWith(origin)) {
    sameOrigin4xx.push(`${r.status()} ${r.url()}`);
  }
});

let renderError = null;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  // The upload UI (file input) only exists once the client app has mounted;
  // a blank page (failed bundle load) never gets here.
  await page.waitForSelector('input[type=file]', { timeout: 15000 });
} catch (e) {
  renderError = e.message;
}

const domProblems = renderError
  ? []
  : await page.evaluate(() => {
      const out = [];
      for (const i of document.querySelectorAll('img')) {
        const src = i.getAttribute('src') || '';
        if (!src || src.includes('undefined') || src.startsWith('/auto/')) {
          out.push(`img src="${src}"`);
        } else if (i.complete && i.naturalWidth === 0) {
          out.push(`img broken src="${src}"`);
        }
      }
      for (const u of document.querySelectorAll('use')) {
        const h = u.getAttribute('xlink:href') || u.getAttribute('href') || '';
        if (h.includes('undefined') || h.startsWith('/auto/')) {
          out.push(`use href="${h}"`);
        }
      }
      for (const el of document.querySelectorAll('script[src], link[href]')) {
        const v = el.getAttribute('src') || el.getAttribute('href') || '';
        if (v.includes('undefined') || v.startsWith('/auto/')) {
          out.push(`${el.tagName.toLowerCase()} "${v}"`);
        }
      }
      return out;
    });

await browser.close();

const failed = renderError || domProblems.length || sameOrigin4xx.length;
if (failed) {
  console.error('Browser check FAILED:');
  if (renderError) console.error(`  app did not render: ${renderError}`);
  for (const p of domProblems) console.error(`  DOM: ${p}`);
  for (const u of sameOrigin4xx) console.error(`  same-origin 4xx: ${u}`);
  process.exit(1);
}

console.log('Browser check passed: app rendered; no undefined/auto/broken assets; no same-origin 4xx.');
