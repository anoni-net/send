const {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

class S3Storage {
  constructor(config, log) {
    this.bucket = config.s3_bucket;
    this.log = log;
    const cfg = {};
    if (config.s3_endpoint) {
      cfg.endpoint = config.s3_endpoint;
    }
    cfg.forcePathStyle = config.s3_use_path_style_endpoint;
    this.client = new S3Client(cfg);
  }

  async length(id) {
    const result = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: id })
    );
    return Number(result.ContentLength);
  }

  // Async in v3: the body stream is only available once the command resolves.
  // Callers already await storage.get(), so this stays compatible.
  async getStream(id) {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: id })
    );
    return result.Body;
  }

  set(id, file) {
    const upload = new Upload({
      client: this.client,
      params: { Bucket: this.bucket, Key: id, Body: file }
    });
    file.on('error', () => upload.abort());
    return upload.done();
  }

  del(id) {
    return this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: id })
    );
  }

  ping() {
    return this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }
}

module.exports = S3Storage;
