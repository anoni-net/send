# Verifying what you are running

Send encrypts your file in your browser. That protection rests on the
JavaScript your browser received being the JavaScript we published: a server
can serve different code to different people, and nothing in the browser tells
you which you got.

This page is how you check, without taking our word for it.

You do not need any of this to use send.anoni.net. It is here because a claim
you cannot check is not worth much.

## What you can check, and what you cannot

You **can** confirm that the JavaScript served to you right now matches what our
public source builds, that the image we publish is the one our CI built, and
that our CI built it from a commit you can read. That covers the code, which is
the part that can do anything to you. Images are a separate case, covered below.

You **cannot** rule out a server that behaves differently for one visitor. If it
served you tampered code and served everyone else, including you when you check,
the correct code, comparing hashes will not reveal it. Defeating that needs
transparency mechanisms this project does not have yet. What the checks below do
give you: tampering that is broad enough to matter is tampering that anyone can
catch, and catching it leaves evidence.

Assume nothing here is trustworthy if the answers do not match. Report
mismatches to <toomore@anoni.net>.

## 1. Check the bytes you were served (2 minutes)

Every release publishes `SHA256SUMS.txt`, listing the sha256 of every file the
server serves. It is attached to the [GitHub release][releases], **not** served
by send.anoni.net: a tampered server would happily serve a matching tampered
list, so the copy has to come from somewhere else.

Find which release an instance is running:

```sh
curl -s https://send.anoni.net/__version__
# {"commit":"...","source":"https://github.com/anoni-net/send","version":"v3.4.27","release":"v4.0.0"}
```

`release` is the version to fetch checksums for. (`version` is the Send API
generation for clients such as `ffsend`, and deliberately does not track our
release numbers.)

Download the list and the script your browser was served, then compare:

```sh
VERSION=v4.0.0                     # the "release" field above
BASE=https://send.anoni.net

curl -sLO "https://github.com/anoni-net/send/releases/download/${VERSION}/SHA256SUMS.txt"

# the main bundle, named exactly as the page references it
ASSET=$(curl -s "$BASE/" | grep -oE '/app\.[a-f0-9]{8}\.js' | head -1)
curl -s "${BASE}${ASSET}" -o "$(basename "$ASSET")"

sha256sum -c SHA256SUMS.txt --ignore-missing    # macOS: shasum -a 256 -c
```

`OK` means the bundle you were served is the one in that release. To check
everything rather than one file, fetch each name listed in `SHA256SUMS.txt` the
same way.

### Images may not match, and that is expected

Check `.js` and `.css`. Those are the files that can execute, and they arrive
untouched.

Images often will not match, because a CDN in front of an instance may
re-compress them in transit. send.anoni.net sits behind Cloudflare, whose Polish
feature re-encodes PNGs: the 32×32 favicon leaves the server at 1025 bytes and
arrives at 746, with a `cf-polished: ok, orig_size=1025` header saying so. The
image is re-encoded, not replaced.

So a `FAILED` on a `.png` next to `OK` on the JavaScript means a CDN is
optimising images. **A `FAILED` on a `.js` file is the one that matters.** Check
for `cf-polished` or similar headers before concluding anything:

```sh
curl -sI "${BASE}/favicon-32x32.<hash>.png" | grep -i 'cf-polished\|content-length'
```

### A CDN is one more party who could change the code

This cuts both ways, and it is worth being plain about. A CDN terminates TLS,
which means it serves the JavaScript, which means it *could* serve different
JavaScript. That is not a hypothetical property of send.anoni.net specifically:
it is true of any site behind any CDN.

It is also the argument for doing the check at all. Comparing what you were
served against a manifest published somewhere else is exactly what would catch
it, whoever did it, including us.

## 2. Check the image is the one our CI built

Published images are signed with [cosign][cosign] using keyless signing, so
there is no key of ours to steal. Verification checks that the signature came
from this repository's publish workflow:

```sh
cosign verify ghcr.io/anoni-net/send:4.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/anoni-net/send/.github/workflows/publish.yml@.*$'
```

The output names the commit and the workflow run that produced the image. Each
image also carries an SBOM and SLSA provenance:

```sh
cosign download sbom ghcr.io/anoni-net/send:4.0.0
docker buildx imagetools inspect ghcr.io/anoni-net/send:4.0.0 --format '{{json .Provenance}}'
```

## 3. Rebuild from source and compare (about 10 minutes)

The strongest check, and the one that needs no trust in us at all: build the
source yourself and confirm you get the same bytes.

```sh
git clone https://github.com/anoni-net/send.git
cd send
git checkout v4.0.0        # the "release" field from /__version__
git tag -v v4.0.0          # optional: PGP signature on the tag

npm ci
npm run build

sha256sum dist/app.*.js    # macOS: shasum -a 256 dist/app.*.js
```

Compare that against `SHA256SUMS.txt` from step 1 and against what the server
served you in step 1. All three should match.

Our builds are reproducible: the same commit produces byte-identical output
across operating systems and Node versions. This was verified across macOS
arm64 with Node 26 and Linux with Node 22, and across `linux/amd64` and
`linux/arm64` images, all 185 files identical. If your rebuild differs, that is
worth reporting even if you suspect your own environment.

## 4. Avoid the problem entirely

Everything above works around one fact: a web app is delivered fresh on every
visit, so it must be re-checked on every visit.

A native client is delivered once. [ffsend][ffsend] speaks the same protocol,
and once you have verified the binary you are not trusting our server's
JavaScript at all. For anyone at real risk, that is the better path, and it is
why the footer links to it.

```sh
ffsend upload ./file.pdf --host https://send.anoni.net
```

## Why the app is small

The smaller the bundle, the more realistic it is for someone to actually read
it. Between v4.0.0 and v5, the JavaScript served on first load went from 203 KB
to 81 KB gzipped, mostly by removing an error-reporting SDK that was never
enabled here and that bundled session-recording code. Nothing a user can see
was removed. Details are in [CHANGELOG.md](CHANGELOG.md).

[releases]: https://github.com/anoni-net/send/releases
[cosign]: https://docs.sigstore.dev/cosign/system_config/installation/
[ffsend]: https://github.com/timvisee/ffsend
