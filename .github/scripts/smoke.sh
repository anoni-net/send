#!/usr/bin/env bash
##
# Smoke test for the built Send image (loaded locally as $SEND_IMAGE, default
# send:ci). Boots the image + redis, asserts the health endpoints, then runs a
# REAL end-to-end encrypted upload/download round-trip with ffsend and compares
# checksums. Health checks alone never touch the WebSocket upload path, which is
# the encryption-critical part, so the round-trip is the assertion that matters.
#
# On failure the send/redis containers are left running so the caller can dump
# their logs. On success they are cleaned up.
##
set -euo pipefail

IMAGE="${SEND_IMAGE:-send:ci}"
PORT=1443
FFSEND_VERSION="v0.2.77"

docker network create sendci
docker run -d --name redis --network sendci redis:alpine
docker run -d --name send --network sendci \
  -e REDIS_HOST=redis \
  -e BASE_URL="http://localhost:${PORT}" \
  -p "${PORT}:${PORT}" "$IMAGE"

echo "Waiting for /__lbheartbeat__ (liveness) ..."
ok=""
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${PORT}/__lbheartbeat__" || true)
  if [ "$code" = "200" ]; then ok=1; echo "  lbheartbeat 200 after ${i} tries"; break; fi
  sleep 2
done
[ -n "$ok" ] || { echo "  timed out waiting for liveness"; docker logs send; exit 1; }

code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${PORT}/__heartbeat__" || true)
echo "  heartbeat (redis/storage) -> ${code}"
[ "$code" = "200" ] || { docker logs send; exit 1; }

ver_json=$(curl -fsS "http://localhost:${PORT}/__version__")
echo "  __version__: ${ver_json}"

# The `version` field advertises the Send API generation, not our release. Third
# party clients gate on it with no fallback: ffsend maps `>=3.0 <4.0` to its V3
# API, so anything outside that range breaks every ffsend user with "unsupported
# version". Our release number lives in `release`. Assert both, because the
# failure is silent from the server's side.
api_ver=$(printf '%s' "$ver_json" | sed -n 's/.*"version":"v\{0,1\}\([0-9][^"]*\)".*/\1/p')
case "$api_ver" in
  3.*) echo "  api version ${api_ver} is in ffsend's supported 3.x range" ;;
  *)   echo "  UNSUPPORTED API VERSION '${api_ver}': ffsend accepts >=3.0 <4.0 only."
       echo "  Report the protocol generation in 'version' and the release in 'release'."
       docker logs send; exit 1 ;;
esac

printf '%s' "$ver_json" | grep -q '"release":' || {
  echo "  __version__ is missing the 'release' field"; docker logs send; exit 1; }

# Render the home page and confirm hashed assets resolve. This is the only check
# that exercises the webpack asset map (server -> common/assets.js -> manifest);
# a broken map injects [object Object] or /undefined instead of a hashed URL.
echo "Page render + asset resolution ..."
html=$(curl -fsS "http://localhost:${PORT}/")
if echo "$html" | grep -qE '\[object Object\]|/undefined'; then
  echo "  broken asset map (found [object Object] or /undefined in rendered HTML)"
  exit 1
fi
# Pull the exact src/href of a hashed JS/CSS asset as the page references it and
# confirm THAT url resolves. Testing a stripped filename would miss a bad
# publicPath (e.g. webpack 5's default 'auto/' prefix that 404s the bundle).
asset=$(echo "$html" | grep -oE '(src|href)="[^"]*\.[a-f0-9]{8}\.(js|css)"' | head -1 | sed -E 's/.*="([^"]*)".*/\1/')
[ -n "$asset" ] || {
  echo "  no hashed asset reference in rendered page"
  echo "$html" | head -30
  exit 1
}
case "$asset" in
  http*) url="$asset" ;;
  /*)    url="http://localhost:${PORT}${asset}" ;;
  *)     url="http://localhost:${PORT}/${asset}" ;;
esac
acode=$(curl -s -o /dev/null -w '%{http_code}' "$url")
echo "  asset ${asset} -> ${acode}"
[ "$acode" = "200" ] || { echo "  page-referenced asset did not resolve (bad publicPath?)"; exit 1; }
echo "  page render + asset resolution OK"

echo "E2EE upload/download round-trip via ffsend ${FFSEND_VERSION} ..."
FF=/tmp/ffsend
curl -fsSL -o "$FF" \
  "https://github.com/timvisee/ffsend/releases/download/${FFSEND_VERSION}/ffsend-${FFSEND_VERSION}-linux-x64-static"
chmod +x "$FF"

head -c 1048576 /dev/urandom > /tmp/send-in.bin
sha_in=$(sha256sum /tmp/send-in.bin | awk '{print $1}')

# -I no-interact, -y yes, -f force (skip the insecure-http warning), -q quiet
url=$("$FF" -Iyf upload -q --host "http://localhost:${PORT}" /tmp/send-in.bin)
echo "  uploaded -> ${url%%#*}#<redacted-key>"

rm -rf /tmp/dl && mkdir -p /tmp/dl
( cd /tmp/dl && "$FF" -Iyf download -q "$url" )
sha_out=$(sha256sum /tmp/dl/send-in.bin | awk '{print $1}')

echo "  sha_in =${sha_in}"
echo "  sha_out=${sha_out}"
[ "$sha_in" = "$sha_out" ] || { echo "  ROUND-TRIP CHECKSUM MISMATCH"; docker logs send; exit 1; }

echo "Smoke test + E2EE round-trip passed."

# Headless browser render check (real chromium): catches client-side regressions
# curl can't see (blank page from a bad publicPath, undefined asset URLs). Runs
# only when playwright is installed (a CI step provides it); local runs skip it.
if [ -f .github/scripts/browser-check.mjs ] && node -e "require.resolve('playwright')" 2>/dev/null; then
  echo "Headless browser render check ..."
  node .github/scripts/browser-check.mjs "http://localhost:${PORT}/"
else
  echo "(playwright not installed; skipping headless browser render check)"
fi

docker rm -f send redis >/dev/null 2>&1 || true
docker network rm sendci >/dev/null 2>&1 || true
