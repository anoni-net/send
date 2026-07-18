# Security Policy

This repository holds the source that the anoni.net community builds and runs at
<https://send.anoni.net>. Send is an end-to-end encrypted file sharing app, so
the code served to a browser is part of the trust boundary: we take reports
about it seriously.

## Reporting a vulnerability

Email **toomore@anoni.net**. Please do not open a public issue for an
unfixed vulnerability.

Useful things to include: affected version or image digest, a description of the
impact, and the steps to reproduce it. If you would like an encrypted reply, say
so and include your key.

We are a small volunteer community, so we cannot promise a fixed response time.
We aim to acknowledge a report within a few days and will tell you what we plan
to do and when. You are welcome to be credited in the release notes for the fix,
or to stay anonymous, whichever you prefer.

## Scope

In scope:

- This repository's source, build and CI configuration.
- The published images at `ghcr.io/anoni-net/send`, including their signatures
  and attestations.
- The running service at `send.anoni.net`, for issues in the application itself.

Out of scope:

- Denial of service through sheer volume, automated scanner output with no
  demonstrated impact, and reports about missing headers with no exploitable
  consequence.
- Abuse of the service to host unwanted files. That is a moderation matter, not
  a vulnerability. Mail the same address and we will act on it.

## Which project to report to

This repository is a downstream continuation of
[timvisee/send](https://gitlab.com/timvisee/send), which is itself a community
fork of Mozilla's discontinued Firefox Send.

If the flaw is in code we inherited unchanged, it affects every Send instance,
not only ours. Report it to upstream as well so other operators can fix it.
Tell us either way and we will coordinate rather than disclose ahead of them.
If the flaw is in something we changed (see [CHANGELOG.md](CHANGELOG.md)), it is
ours alone.

## Supported versions

We support the most recent release. Older tags stay published for
reproducibility, and they do not receive fixes.

## Verifying what you run

Every published image is signed by our CI with cosign (keyless, via Sigstore),
and carries an SBOM and SLSA provenance. Verification instructions are in the
[README](README.md#using-our-image). A signature that fails to verify is itself
worth reporting.
