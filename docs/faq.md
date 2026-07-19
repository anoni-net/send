## How big of a file can I transfer with Send?

This instance accepts files up to 2.5 GB, and an operator running their own can
change that. Send encrypts and decrypts files in the browser, which is what
keeps the server from ever seeing them, but it means the work happens on your
machine: expect memory use to rise by at least the size of the file while a
transfer is in progress. On an ordinary laptop, transfers of a few hundred
megabytes are the most reliable.

## Why is my browser not supported?

Send encrypts with the [Web Cryptography API using
AES-GCM](https://www.w3.org/TR/WebCryptoAPI/#aes-gcm). Most current browsers
implement it. Some, mobile browsers in particular, still do not, and Send has no
fallback: doing the same encryption in ordinary JavaScript would be slower and
weaker, so we would rather tell you your browser cannot do it than quietly give
you something less.

## Why does Send require JavaScript?

Send uses JavaScript to:

- Encrypt and decrypt files on your device rather than on the server.
- Render the user interface.
- Show the interface in [various different
  languages](https://github.com/anoni-net/send#localization).

The first point is the whole design. The server stores ciphertext it cannot
read, and the key never reaches it: the key lives in the part of the share link
after the `#`, which browsers do not send to servers.

Send collects no analytics and reports nothing to any third party. The code that
runs in your browser is [public](https://github.com/anoni-net/send/), and
[VERIFYING.md](../VERIFYING.md) sets out how to check that the JavaScript this
site serves you was built from it.

## How long are files available for?

You choose when you upload: from five minutes up to seven days, with 24 hours as
the default. A file is also removed as soon as it reaches the download limit you
set, which can be anywhere from one download to a hundred. Whichever comes
first, the file is deleted from the server.

An operator running their own instance can set different maximums.

## Can a file be downloaded more than once?

Yes. The limit defaults to one download and you can raise it when you upload.
