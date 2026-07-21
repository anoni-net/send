# File Encryption

Send uses 128-bit AES-GCM encryption via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to encrypt files in the browser before uploading them to the server. The code is in [app/keychain.js](../app/keychain.js).

## Steps

### Uploading

1. A new secret key is generated with `crypto.getRandomValues`
2. The secret key is used to derive more keys via HKDF SHA-256
    - a series of encryption keys for the file, via [ECE](https://tools.ietf.org/html/rfc8188) (AES-GCM)
    - an encryption key for the file metadata (AES-GCM)
    - a signing key for request authentication (HMAC SHA-256)
3. The file and metadata are encrypted with their corresponding keys
4. The encrypted data and signing key are uploaded to the server
5. An owner token and the share url are returned by the server and stored in local storage
6. The secret key is appended to the share url as a [#fragment](https://en.wikipedia.org/wiki/Fragment_identifier) and presented to the UI

### Downloading

1. The browser loads the share url page, which includes an authentication nonce
2. The browser imports the secret key from the url fragment
3. The same 3 keys as above are derived
4. The browser signs the nonce with its signing key and requests the metadata
5. The encrypted metadata is decrypted and presented on the page
6. The browser makes another authenticated request to download the encrypted file
7. The browser downloads and decrypts the file
8. The file prompts the save dialog or automatically saves depending on the browser settings

### Passwords

A password may optionally be set to authenticate the download request. When a password is set the following steps occur.

#### Sender

1. The original signing key derived from the secret key is discarded
2. A new signing key is generated via PBKDF2 from the user entered password and the full share url (including secret key fragment)
3. The new key is sent to the server, authenticated by the owner token
4. The server stores the new key and marks the record as needing a password

The PBKDF2 derivation uses SHA-256 with 100 iterations, which is far below what
you would choose for a password stored on a server. The password protects the
download *authorization* only: the file's encryption key comes from the url
fragment, and the salt is the full share url, so anyone in a position to run this
derivation already holds the secret that decrypts the file. Raising the iteration
count would change what existing links compute and is deliberately left alone for
now.

#### Downloader

1. The browser loads the share url page, which includes an authentication nonce and indicator that the file requires a password
2. The user is prompted for the password and the signing key is derived
3. The browser requests the metadata using the key to sign the nonce
4. If the password was correct the metadata is returned, otherwise a 401

#### The share url is part of the password

Because the PBKDF2 salt is the full share url, the sender and the downloader
derive the same signing key only when they use the same url, character for
character. Open a password-protected link on a different hostname and the key
differs, so the server returns a 401 and the downloader is told the password is
wrong even when it is correct.

This matters when one instance answers on more than one address, for example a
clearnet host and a `.onion` mirror. A link created on one and opened on the
other cannot be unlocked. A trailing slash, a port, or an `http` vs `https`
difference in front of the fragment has the same effect. Share the exact url the
uploader was given, and give a password-protected link out on the address it was
made on. This is inherited from upstream; fixing it properly means changing the
salt, which would break every existing link.
