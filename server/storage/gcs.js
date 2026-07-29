const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

class GCSStorage {
  constructor(config, log) {
    this.bucket = storage.bucket(config.gcs_bucket);
    this.log = log;
  }

  async length(id) {
    const data = await this.bucket.file(id).getMetadata();
    return data[0].size;
  }

  getStream(id) {
    return this.bucket.file(id).createReadStream({ validation: false });
  }

  set(id, file) {
    return new Promise((resolve, reject) => {
      file
        .pipe(
          this.bucket.file(id).createWriteStream({
            validation: false,
            resumable: true
          })
        )
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  del(id) {
    return this.bucket.file(id).delete();
  }

  // exists() resolves to [false] for a bucket that is not there rather than
  // rejecting, so returning it directly made /__heartbeat__ answer 200 while
  // storage was unreachable. The S3 and filesystem backends both throw, and a
  // heartbeat that cannot fail is not a heartbeat.
  async ping() {
    const [exists] = await this.bucket.exists();
    if (!exists) {
      throw new Error('GCS bucket is not reachable');
    }
  }
}

module.exports = GCSStorage;
