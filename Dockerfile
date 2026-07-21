##
# Send
#
# License https://gitlab.com/timvisee/send/blob/master/LICENSE
##

# Build project
FROM node:22-alpine3.22 AS builder

RUN set -x \
  # Change node uid/gid
  && apk --no-cache add shadow \
  && groupmod -g 1001 node \
  && usermod -u 1001 -g 1001 node

RUN set -x \
    # Add user
    && addgroup --gid 1000 app \
    && adduser --disabled-password \
        --gecos '' \
        --ingroup app \
        --home /app \
        --uid 1000 \
        app

COPY --chown=app:app . /app

USER app
WORKDIR /app

RUN set -x \
    # Build
    && PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm ci \
    && npm run build

# Main image
FROM node:22-alpine3.22

RUN set -x \
  # Pick up OS security patches published since the base image was built. The
  # base tag lags: it shipped libcrypto3/libssl3 3.5.6-r0 while 3.5.7-r0 was
  # already out with a fix.
  #
  # This makes the OS layer depend on when the image is built. It does not
  # affect the reproducibility claim in VERIFYING.md, which is about dist/,
  # built by webpack from source and unaffected by apk.
  && apk --no-cache upgrade \
  # Change node uid/gid
  && apk --no-cache add shadow \
  && groupmod -g 1001 node \
  && usermod -u 1001 -g 1001 node

RUN set -x \
    # Add user
    && addgroup --gid 1000 app \
    && adduser --disabled-password \
        --gecos '' \
        --ingroup app \
        --home /app \
        --uid 1000 \
        app

USER app
WORKDIR /app

COPY --chown=app:app package*.json ./
COPY --chown=app:app app app
COPY --chown=app:app common common
COPY --chown=app:app public/locales public/locales
COPY --chown=app:app server server
COPY --chown=app:app --from=builder /app/dist dist

# Install, then remove the things only the install needed. What is left is what
# the app actually runs on, which is also what a vulnerability scan should see.
#
#   - the lockfile declares the whole dev tree (~1500 packages) while ~240 are
#     installed, so scanners read it and report CVEs for absent packages
#   - npm itself ships ~200 bundled dependencies of its own, and those were the
#     source of every npm-side HIGH this image reported (picomatch, sigstore).
#     The container starts with `node server/bin/prod.js` and never calls npm.
USER root
# --ignore-scripts: this runs as root, so any dependency lifecycle script would
# run as root too. No package in the production tree declares one today (checked
# across the whole `npm ls --omit=dev` tree), so this makes a latent risk
# structural rather than relying on that staying true. The app is prebuilt into
# dist/ and needs no install-time scripts of its own.
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force \
  && rm -f package-lock.json \
  && rm -rf /usr/local/lib/node_modules/npm \
            /usr/local/bin/npm /usr/local/bin/npx \
  && chown -R app:app /app
USER app
RUN ln -s dist/version.json version.json

ENV PORT=1443

# Two protections are gated on this: the Content-Security-Policy headers, and
# the per-IP rate limits. server/config.js defaults to `development` because
# that is the right default for `npm start` and for the frontend test suite,
# which legitimately bursts uploads from one address and would otherwise be
# rate-limited by its own server.
#
# An image is not that. Every container built from this file is somebody's
# deployment, and inheriting the development default meant a Send instance
# served no CSP and applied no rate limit unless its operator knew to pass
# NODE_ENV themselves. Set here rather than in the builder stage above, so it
# cannot influence the webpack build and the reproducibility guarantee in
# VERIFYING.md still compares like with like.
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "server/bin/prod.js"]
