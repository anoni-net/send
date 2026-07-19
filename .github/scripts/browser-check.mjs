// Headless browser regression check for the built Send image.
//
// Loads the home page in real chromium, waits for the client app to render, and
// asserts there are no broken or unresolved assets and that the page is actually
// styled. This catches client-side regressions the curl-based smoke test cannot
// see, because the server-rendered HTML can be correct while the hydrated app is
// broken or unstyled:
//   - webpack 5 publicPath:'auto' -> /auto/app.<hash>.js 404 -> blank page
//   - asset-map interop bug        -> <img src="undefined"> (missing logo)
//   - purgecss content globs too shallow -> Tailwind classes stripped -> the
//     stylesheet still returns 200 and every test passes, but the page renders
//     with no styling at all. That happened when app/ui/archiveTile/ was split
//     into a subdirectory the globs did not cover, and nothing except looking
//     at the page caught it.
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
  const u = r.url();
  // Ignore incidental probes (favicon) and source maps so only real broken
  // asset references (e.g. a /auto/ 404) fail the check.
  const incidental = /\/favicon\.ico(\?|$)/.test(u) || u.endsWith('.map');
  if (r.status() >= 400 && u.startsWith(origin) && !incidental) {
    sameOrigin4xx.push(`${r.status()} ${u}`);
  }
});

let renderError = null;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  // The upload UI's file input only exists once the client app has mounted; a
  // blank page (failed bundle load) never gets here. Use state:'attached' — the
  // input is intentionally hidden (a styled button triggers it), so the default
  // 'visible' wait would time out even on a healthy page.
  await page.waitForSelector('input[type=file]', {
    state: 'attached',
    timeout: 15000
  });
} catch (e) {
  renderError = e.message;
  try {
    const diag = await page.evaluate(() => ({
      title: document.title,
      bodyText: document.body ? document.body.innerText.slice(0, 500) : '(no body)',
      inputs: document.querySelectorAll('input').length,
      fileInputs: document.querySelectorAll('input[type=file]').length
    }));
    console.error('  page diagnostics:', JSON.stringify(diag));
  } catch (_) {
    /* ignore */
  }
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

// Styling. Each assertion names a computed value that only exists because a
// Tailwind utility resolved, so a stripped stylesheet fails here rather than
// shipping. The dropzone is checked deliberately: it is rendered from
// app/ui/archiveTile/, the directory the purgecss globs used to miss.
const styleProblems = renderError
  ? []
  : await page.evaluate(() => {
      const out = [];
      const body = getComputedStyle(document.body);
      // body carries "flex flex-col items-center font-sans"
      if (body.display !== 'flex') {
        out.push(`body display is "${body.display}", expected "flex"`);
      }
      if (body.flexDirection !== 'column') {
        out.push(`body flex-direction is "${body.flexDirection}"`);
      }
      if (!/Inter/.test(body.fontFamily)) {
        out.push(`body font-family is "${body.fontFamily}", expected Inter`);
      }

      const dropzone = document.querySelector('.border-dashed');
      if (!dropzone) {
        out.push('no .border-dashed element (upload dropzone) on the page');
      } else {
        const dz = getComputedStyle(dropzone);
        if (dz.borderStyle !== 'dashed') {
          out.push(`dropzone border-style is "${dz.borderStyle}"`);
        }
        if (parseFloat(dz.borderWidth) < 1) {
          out.push(`dropzone border-width is "${dz.borderWidth}"`);
        }
      }

      const btn = document.querySelector('.btn');
      if (!btn) {
        out.push('no .btn element on the page');
      } else {
        const bg = getComputedStyle(btn).backgroundColor;
        // an unstyled button is transparent or the UA default grey
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
          out.push(`primary button background is "${bg}"`);
        }
      }

      // A wholesale purge leaves a stylesheet that still loads but is nearly
      // empty. The healthy build has ~245 rules; the floor only needs to be
      // clear of that failure mode, not track the real number.
      let rules = 0;
      for (const sheet of document.styleSheets) {
        try {
          rules += sheet.cssRules.length;
        } catch (e) {
          // cross-origin sheet, not ours
        }
      }
      if (rules < 50) {
        out.push(`only ${rules} CSS rules loaded, expected the app stylesheet`);
      }
      return out;
    });

await browser.close();

const failed =
  renderError ||
  domProblems.length ||
  sameOrigin4xx.length ||
  styleProblems.length;
if (failed) {
  console.error('Browser check FAILED:');
  if (renderError) console.error(`  app did not render: ${renderError}`);
  for (const p of domProblems) console.error(`  DOM: ${p}`);
  for (const u of sameOrigin4xx) console.error(`  same-origin 4xx: ${u}`);
  for (const s of styleProblems) console.error(`  style: ${s}`);
  process.exit(1);
}

console.log(
  'Browser check passed: app rendered and styled; no undefined/auto/broken assets; no same-origin 4xx.'
);
