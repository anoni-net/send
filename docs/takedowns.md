## Take-down process

In cases of a DMCA notice, or other abuse yet to be determined, a file has to be
removed from the service.

A share link contains the `id` of the file, for example
`https://send.example.com/download/3d9d2bb9a1`. Everything the server knows about
that file, other than the ciphertext itself, is one redis key under that `id`.

From a host with access to the redis server, run `DEL` with the file id:

```sh
redis-cli DEL 3d9d2bb9a1
```

Other `redis-cli` parameters like `-h` may also be required. See the
[redis-cli docs](https://redis.io/topics/rediscli) for more.

That is enough to make the file unreachable. Every route that serves or describes
a file reads its redis record first, so once the record is gone the download,
metadata, and exists endpoints all answer `404`. There is no second copy of the
record, and the server never held the decryption key at all: it stays in the `#`
fragment of the share link, which browsers do not send.

### Removing the ciphertext

`DEL` leaves the encrypted bytes on the storage backend. What happens to them
depends on which backend is in use:

- **Filesystem** (the default): a periodic sweep deletes files whose redis record
  is gone, so the ciphertext goes within `REAP_INTERVAL_SECONDS`, 15 minutes by
  default. Nothing else to do. See "Expired file cleanup" in
  [docker.md](docker.md).
- **S3**: the object is stored under the same `id` in the bucket named by
  `S3_BUCKET`. Delete it with the
  [AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html) or the
  AWS console.
- **GCS**: the object is stored under the same `id` in the bucket named by
  `GCS_BUCKET`. Delete it with `gcloud storage` or the Google Cloud console.

Ordinary expiry works the same way. Redis holds the only TTL, and when it fires
the record disappears exactly as `DEL` would leave it, so the same sweep and the
same lifecycle rules cover both cases.
