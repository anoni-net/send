# Send — anoni.net self-hosted source

This repository holds the source of [Send][upstream] that the [anoni.net][anoni]
community self-hosts at **https://send.anoni.net**. Send is a simple, private,
end-to-end encrypted file-sharing web app: files are encrypted in the browser
and the server only ever stores ciphertext, never the decryption key.

## Relationship to upstream

This is a **downstream copy, not a GitHub fork.** Send's canonical repository
lives on GitLab and is only mirrored to GitHub, so the GitHub fork network does
not apply here. We keep our own standalone repository instead:

- Upstream (maintained by Tim Visée): <https://gitlab.com/timvisee/send>
  (mirror: <https://github.com/timvisee/send>)
- Upstream is itself a community fork of Mozilla's discontinued
  [Firefox Send](https://github.com/mozilla/send).

This repository exists so the anoni.net community can pin, review, build and
modernize the exact code we run, with our own CI and signed images.

Since **v4.0.0** our version numbers no longer track upstream's. Upstream's last
release was v3.4.27, which is the commit this repository diverged from.

We are **not affiliated with, nor endorsed by, Mozilla or Tim Visée.** All
*Mozilla* and *Firefox* branding was already removed upstream so the project can
be self-hosted legally.

### Staying in sync with upstream

Upstream is tracked through a git remote named `upstream`:

```sh
git remote -v
# origin    https://github.com/anoni-net/send.git   (this repo)
# upstream  https://gitlab.com/timvisee/send.git     (canonical)

git fetch upstream
git merge upstream/master   # review, then push to origin/main
```

## What we changed

The full history was imported from upstream and preserved, including all tags.
Everything below was done on top of upstream v3.4.27. See
[CHANGELOG.md](CHANGELOG.md) for the detailed list.

- **Runtime and build stack modernized** — Node 16 to 22, webpack 4 to 5,
  node-redis 3 to 6, aws-sdk v2 to v3, `@google-cloud/storage` 6 to 7,
  `@sentry/browser` 6 to 7.
- **Supply chain** — we build and publish our own multi-arch image to
  `ghcr.io/anoni-net/send`, signed with cosign (keyless, Sigstore), with an SBOM
  and SLSA provenance attached, and scanned with Trivy.
- **Tests** — backend, frontend (Playwright) and a headless browser check now
  run in CI, alongside a real end-to-end encrypted upload and download
  round-trip against a freshly built image.
- **No protocol or crypto changes.** The wire format, URL format and encryption
  are untouched, so existing links and third-party clients such as `ffsend`
  keep working.

Our **deployment configuration** (Docker Compose, nginx, hostnames) is kept
separately and is not part of this repository.

## Using our image

The image is public, so pulling needs no login:

```sh
docker pull ghcr.io/anoni-net/send:4.0.0
```

Every published image is signed by our CI. Verify it before you run it:

```sh
cosign verify ghcr.io/anoni-net/send:4.0.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/anoni-net/send/.github/workflows/publish.yml@.*$'
```

Pin by digest (`@sha256:...`) in production so the tag cannot move under you.

## Verifying what you are running

Send encrypts in the browser, so its protection rests on the JavaScript your
browser received being the JavaScript we published. That is checkable, and
[VERIFYING.md](VERIFYING.md) is the step-by-step:

- compare the bytes an instance served you against the `SHA256SUMS.txt` attached
  to the matching [release](https://github.com/anoni-net/send/releases), which
  comes from GitHub rather than from the server being checked,
- verify the image signature, SBOM and provenance with `cosign`,
- or rebuild from source and compare. Our builds are reproducible: the same
  commit produces byte-identical output across operating systems and Node
  versions.

## Upstream documentation

The original project README is preserved verbatim as
[README.upstream.md](README.upstream.md). Full docs live under [docs/](docs/):
[FAQ](docs/faq.md), [Encryption](docs/encryption.md), [Build](docs/build.md),
[Docker](docs/docker.md).

## License & attribution

Send is licensed under the [Mozilla Public License 2.0](LICENSE) (MPL-2.0), and
`qrcode.js` is licensed under MIT. This downstream copy keeps the same license,
unchanged. Copyright remains with Mozilla, Tim Visée and the Send contributors
listed in [CONTRIBUTORS](CONTRIBUTORS); anoni.net's own modifications are
released under the same MPL-2.0.

[upstream]: https://gitlab.com/timvisee/send
[anoni]: https://anoni.net/
