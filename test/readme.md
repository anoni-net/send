# Tests

`npm test` runs the backend and frontend suites. [Mocha](https://mochajs.org) is
the test runner for both. CI runs the same suites on every pull request (see
`.github/workflows/tests.yml`), along with lint and a reproducible-build check.

## Backend

Unit tests live in `test/backend` and run with `npm run test:backend`.
[Sinon](https://sinonjs.org/) and
[proxyquire](https://github.com/thlorenz/proxyquire) handle mocking. The run
writes coverage data, and `npm run test:report` turns it into an HTML report
under `coverage/`.

## Frontend

Unit tests live in `test/frontend/tests`. `npm run test:frontend` builds the
test bundle, serves it, and runs the suite in headless Chromium through
[Playwright](https://playwright.dev/), printing the results to the console.

Install the browser once with `npx playwright install chromium`. The workflow
tests do a real upload through the test server, so they need a Redis on
`localhost:6379`, for example `docker run --rm -p 6379:6379 redis:alpine`.

## Image smoke test

`.github/scripts/smoke.sh` boots a built image next to Redis, checks the health
endpoints and the rendered page, and runs an encrypted upload and download
round trip with [ffsend](https://github.com/timvisee/ffsend). CI runs it against
every image it builds. To run it locally, build the image as `send:ci` first.
