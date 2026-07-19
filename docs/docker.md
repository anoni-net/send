## Docker Quickstart

This repository publishes its own image to `ghcr.io/anoni-net/send`. Every
published image is signed by our CI with cosign, and carries an SBOM and SLSA
provenance. [VERIFYING.md](../VERIFYING.md) shows how to check all of that, and
how to confirm the JavaScript a running instance serves matches this source.

```bash
docker pull ghcr.io/anoni-net/send:latest

# example quickstart (point REDIS_HOST to an already-running redis server)
docker run -v $PWD/uploads:/uploads -p 1443:1443 \
    -e 'DETECT_BASE_URL=true' \
    -e 'REDIS_HOST=localhost' \
    -e 'FILE_DIR=/uploads' \
    ghcr.io/anoni-net/send:latest
```

Verify the signature before running it, and pin by digest (`@sha256:...`) in
production so the tag cannot move under you:

```bash
cosign verify ghcr.io/anoni-net/send:latest \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/anoni-net/send/.github/workflows/publish.yml@.*$'
```

Or clone this repo and run `docker build -t send:latest .` to build an image
locally. The build is reproducible, so a local build and the published image
produce identical `dist/` output.

*Upstream ([timvisee/send](https://gitlab.com/timvisee/send)) publishes its own
image at `registry.gitlab.com/timvisee/send`. It is a different build from a
different source tree, so nothing in this repository, including the signatures
and checksums above, says anything about it.*

## Environment Variables

All the available config options and their defaults can be found here: https://github.com/anoni-net/send/blob/main/server/config.js

Config options should be set as unquoted environment variables. Boolean options should be `true`/`false`, time/duration should be integers (seconds), and filesize values should be integers (bytes).

Config options expecting array values (e.g. `EXPIRE_TIMES_SECONDS`, `DOWNLOAD_COUNTS`) should be in unquoted CSV format. UI dropdowns will default to the first value in the CSV, e.g. `DOWNLOAD_COUNTS=5,1,10,100` will show four dropdown options, with `5` selected by the default.

#### Server Configuration

| Name     | Description |
|------------------|-------------|
| `BASE_URL`       | The HTTPS URL where traffic will be served (e.g. `https://send.example.com`)
| `DETECT_BASE_URL` | Autodetect the base URL using browser if `BASE_URL` is unset (defaults to `false`)
| `PORT`           | Port the server will listen on (defaults to `1443`)
| `NODE_ENV`       | Run in `development` mode (unsafe) or `production` mode (the default)
| `SEND_FOOTER_DMCA_URL` | A URL to a contact page for DMCA requests (empty / not shown by default)

*Note: more options can be found here: https://github.com/anoni-net/send/blob/main/server/config.js*

#### Upload and Download Limits

Configure the limits for uploads and downloads. Long expiration times are risky on public servers as people may use you as free hosting for copyrighted content or malware (which is why Mozilla shut down their `send` service). It's advised to only expose your service on a LAN/intranet, password protect it with a proxy/gateway, or make sure to set `SEND_FOOTER_DMCA_URL` above so you can respond to takedown requests.

| Name    | Description |
|------------------|-------------|
| `MAX_FILE_SIZE` | Maximum upload file size in bytes (defaults to `2684354560` aka 2.5GB)
| `MAX_FILES_PER_ARCHIVE` | Maximum number of files per archive (defaults to `64`)
| `MAX_EXPIRE_SECONDS` | Maximum upload expiry time in seconds (defaults to `604800` aka 7 days)
| `MAX_DOWNLOADS` | Maximum number of downloads (defaults to `100`)
| `DOWNLOAD_COUNTS` | Download limit options to show in UI dropdown, e.g. `10,1,2,5,10,15,25,50,100,1000`
| `EXPIRE_TIMES_SECONDS` | Expire time options to show in UI dropdown, e.g. `3600,86400,604800,2592000,31536000`
| `DEFAULT_DOWNLOADS` | Default download limit in UI (defaults to `1`)
| `DEFAULT_EXPIRE_SECONDS` | Default expire time in UI (defaults to `86400`)

*Note: more options can be found here: https://github.com/anoni-net/send/blob/main/server/config.js*

#### Storage Backend Options

Pick how you want to store uploaded files and set these config options accordingly:

- Local filesystem (the default): set `FILE_DIR` to the local path used inside the container for storage (or leave the default)
- S3-compatible object store: set `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (and `S3_ENDPOINT` if using something other than AWS)
- Google Cloud Storage: set `GCS_BUCKET` to the name of a GCS bucket (auth should be set up using [Application Default Credentials](https://cloud.google.com/docs/authentication/production#auth-cloud-implicit-nodejs))

Redis is used as the metadata database for the backend and is required no matter which storage method you use.

#### Expired file cleanup

Redis holds the only expiry TTL. When it fires, a file's metadata is gone, but
the file itself is removed only when a download reaches its limit or an owner
deletes it. A file that is uploaded and never downloaded would otherwise sit on
disk after it expires. On the **filesystem backend** a periodic sweep deletes
these orphaned files. It is on by default and needs no configuration.

For **S3 and GCS** the sweep does not run (listing an object store is not free).
Use a bucket lifecycle rule to expire objects instead, set to at least your
`MAX_EXPIRE_SECONDS` so it never removes a file that is still live.

| Name  | Description |
|------------------|-------------|
| `REAP_INTERVAL_SECONDS` | How often the filesystem sweep runs, in seconds (defaults to `900`). Set to `0` to disable it.
| `REAP_GRACE_SECONDS` | A file must be at least this old to be swept, so an in-flight upload is never mistaken for an orphan (defaults to `900`).

#### S3 and GCS need their SDK installed

The published image ships with the filesystem backend only. The AWS and Google
SDKs are large: together they are more than half of the dependencies a
filesystem deployment would otherwise carry, for code it never loads. They are
therefore not installed by default.

To use either backend, build an image with the SDK added:

```dockerfile
FROM ghcr.io/anoni-net/send:latest
USER root
RUN npm install --no-save @aws-sdk/client-s3 @aws-sdk/lib-storage
# ...or, for Google Cloud Storage:
# RUN npm install --no-save @google-cloud/storage
USER app
```

Setting `S3_BUCKET` or `GCS_BUCKET` without the matching SDK fails at startup
with a message naming the package to install.

| Name  | Description |
|------------------|-------------|
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PASSWORD`, `REDIS_DB` | Host name, port, and pass of the Redis server (defaults to `localhost`, `6379`, and no password)
| `FILE_DIR`       | Directory for storage inside the Docker container (defaults to `/uploads`)
| `S3_BUCKET`  | The S3 bucket name to use (only set if using S3 for storage)
| `S3_ENDPOINT` | An optional custom endpoint to use for S3 (defaults to AWS)
| `S3_USE_PATH_STYLE_ENDPOINT`| Whether to force [path style URLs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#s3ForcePathStyle-property) for S3 objects (defaults to `false`)
| `AWS_ACCESS_KEY_ID` | S3 access key ID (only set if using S3 for storage)
| `AWS_SECRET_ACCESS_KEY` | S3 secret access key ID (only set if using S3 for storage)
| `GCS_BUCKET` | Google Cloud Storage bucket (only set if using GCP for storage)

*Note: more options can be found here: https://github.com/anoni-net/send/blob/main/server/config.js*

## Branding

To change the look the colors aswell as some graphics can be changed via environment variables.  
See the table below for the variables and their default values.

| Name | Default | Description |
|---|---|---|
| UI_COLOR_PRIMARY | #0a84ff | The primary color |
| UI_COLOR_ACCENT | #003eaa | The accent color (eg. for hover-effects) |
| UI_CUSTOM_ASSETS_ANDROID_CHROME_192PX | | A custom icon for Android (192x192px) |
| UI_CUSTOM_ASSETS_ANDROID_CHROME_512PX | | A custom icon for Android (512x512px) |
| UI_CUSTOM_ASSETS_APPLE_TOUCH_ICON | | A custom icon for Apple |
| UI_CUSTOM_ASSETS_FAVICON_16PX | | A custom favicon (16x16px) |
| UI_CUSTOM_ASSETS_FAVICON_32PX | | A custom favicon (32x32px) |
| UI_CUSTOM_ASSETS_ICON | | A custom icon (Logo on the top-left of the UI) |
| UI_CUSTOM_ASSETS_SAFARI_PINNED_TAB | | A custom icon for Safari |
| UI_CUSTOM_ASSETS_FACEBOOK | | A custom header image for Facebook |
| UI_CUSTOM_ASSETS_TWITTER | | A custom header image for Twitter |
| UI_CUSTOM_ASSETS_WORDMARK | | A custom wordmark (Text next to the logo) |
| UI_CUSTOM_CSS | | Allows you to define a custom CSS file for custom styling |
| CUSTOM_FOOTER_TEXT | | Allows you to define a custom footer |
| CUSTOM_FOOTER_URL | | Allows you to define a custom URL in your footer |

Side note: If you define a custom URL and a custom footer, only the footer text will display, but will be hyperlinked to the URL.

## Examples

**Run using an Amazon Elasticache for the Redis DB and Amazon S3 for the storage backend.**

```bash
$ docker run -p 1443:1443 \
  -e 'S3_BUCKET=testpilot-p2p-dev' \
  -e 'REDIS_HOST=dyf9s2r4vo3.bolxr4.0001.usw2.cache.amazonaws.com' \
  -e 'BASE_URL=https://send.example.com' \
  ghcr.io/anoni-net/send:latest
```

*Note: make sure to replace the example values above with your real values before running.*


**Run totally self-hosted using the current filesystem directry (`$PWD`) to store the Redis data and file uploads, with a `5GB` upload limit, 1 month expiry, and contact URL set.**

```bash
# create a network for the send backend and redis containers to talk to each other
$ docker network create sendnet

# start the redis container
$ docker run --net=sendnet -v $PWD/redis:/data redis-server --appendonly yes

# start the send backend container
$ docker run --net=sendnet -v $PWD/uploads:/uploads -p 1443:1443 \
    -e 'BASE_URL=http://localhost:1443' \
    -e 'MAX_FILE_SIZE=5368709120' \
    -e 'MAX_EXPIRE_SECONDS=2592000' \
    -e 'SEND_FOOTER_DMCA_URL=https://example.com/dmca-contact-info' \
    ghcr.io/anoni-net/send:latest
```
Then open http://localhost:1443 to view the UI. (change the `localhost` to your IP or hostname above to serve the UI to others)

To run with HTTPS, you will need to set up a reverse proxy with SSL termination in front of the backend. See Docker Compose below for an example setup.


**Run with custom branding.**

```bash
$ docker run -p 1443:1443 \
    -v $PWD/custom_assets:/app/dist/custom_assets \
    -e 'UI_COLOR_PRIMARY=#f00' \
    -e 'UI_COLOR_ACCENT=#a00' \
    -e 'UI_CUSTOM_ASSETS_ICON=custom_assets/logo.svg' \
    ghcr.io/anoni-net/send:latest
```

## Docker Compose

For a Docker compose configuration example, see
[timvisee/send-docker-compose](https://github.com/timvisee/send-docker-compose).
It is written for upstream's image, so change the `image:` line to
`ghcr.io/anoni-net/send:latest` if you want the build this repository
publishes.
