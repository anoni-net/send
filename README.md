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
(in future) modernize the exact code we run, with our own CI and signed images.

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

- **Nothing in the application code yet.** `main` currently mirrors upstream
  `master` (renamed to `main`) with full history and all tags preserved.
- Our **deployment configuration** (Docker Compose, nginx, hostnames) is kept
  separately and is not part of this repository.

Planned work, tracked in issues: upgrade the runtime and build stack (Node,
Redis client, webpack), harden the container and supply chain, and publish our
own signed image. Until then, follow the upstream docs for build and run
instructions.

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
