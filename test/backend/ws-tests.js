const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

const config = {
  default_expire_seconds: 86400,
  default_downloads: 1,
  max_expire_seconds: 86400 * 7,
  max_downloads: 100,
  max_metadata_size: 64 * 1024,
  max_file_size: 1024,
  rate_limit_window_seconds: 60,
  upload_rate_limit_max: 20,
  env: 'test'
};

const ws = proxyquire('../../server/routes/ws', {
  '../config': config,
  '../storage': {},
  '../log': () => ({ info() {}, warn() {}, error() {} })
});

const { readUploadRequest, validUploadRequest } = ws;

// A request as the client actually sends it, minus whatever the case overrides.
function upload(overrides) {
  return readUploadRequest(
    Object.assign(
      {
        fileMetadata: 'encrypted-metadata',
        authorization: 'send-v1 abcdef',
        timeLimit: 3600,
        dlimit: 1
      },
      overrides
    )
  );
}

describe('upload request validation', function() {
  it('accepts an ordinary request', function() {
    assert.equal(validUploadRequest(upload({})), true);
  });

  it('accepts numeric strings, which third-party clients may send', function() {
    const r = upload({ timeLimit: '3600', dlimit: '5' });
    assert.equal(r.timeLimit, 3600);
    assert.equal(r.dlimit, 5);
    assert.equal(validUploadRequest(r), true);
  });

  it('falls back to the defaults when the values are absent', function() {
    const r = readUploadRequest({
      fileMetadata: 'm',
      authorization: 'a'
    });
    assert.equal(r.timeLimit, config.default_expire_seconds);
    assert.equal(r.dlimit, config.default_downloads);
    assert.equal(validUploadRequest(r), true);
  });

  // The reported bug: these all passed, because every comparison against a
  // non-numeric value is false. The stored file then had no TTL and a filename
  // the reaper would never match.
  describe('non-numeric expiry', function() {
    // The invariant that matters: a request never gets through carrying an
    // expiry that storage cannot turn into a valid filename prefix and a valid
    // TTL. Some values fall back to the default and proceed, others are
    // rejected outright. Either is fine. Proceeding with a bad value is not.
    for (const timeLimit of [
      'abc',
      '7d',
      {},
      [1, 2],
      true,
      'Infinity',
      '1e999',
      null
    ]) {
      it(`never proceeds with a bad expiry for ${JSON.stringify(timeLimit)}`, function() {
        const r = upload({ timeLimit });
        if (validUploadRequest(r)) {
          assert.ok(
            Number.isInteger(r.timeLimit) &&
              r.timeLimit > 0 &&
              r.timeLimit <= config.max_expire_seconds,
            `accepted with timeLimit ${r.timeLimit}`
          );
        }
      });
    }
  });

  it('rejects an out-of-range or fractional expiry', function() {
    for (const timeLimit of [
      config.max_expire_seconds + 1,
      1.5,
      -1,
      Number.MAX_SAFE_INTEGER
    ]) {
      const r = upload({ timeLimit });
      // -1 and fractional values must not be silently accepted.
      if (r.timeLimit === config.default_expire_seconds) continue;
      assert.equal(
        validUploadRequest(r),
        false,
        `accepted timeLimit ${timeLimit} -> ${r.timeLimit}`
      );
    }
  });

  it('rejects an out-of-range or fractional download limit', function() {
    for (const dlimit of [config.max_downloads + 1, 2.5, -3]) {
      const r = upload({ dlimit });
      if (r.dlimit === config.default_downloads) continue;
      assert.equal(
        validUploadRequest(r),
        false,
        `accepted dlimit ${dlimit} -> ${r.dlimit}`
      );
    }
  });

  // `.length` on an array is its element count and on an object is undefined,
  // so both slipped past the size cap and reached redis.
  it('rejects metadata that is not a string', function() {
    for (const fileMetadata of [['a', 'b'], {}, { length: 5 }, 42, true]) {
      assert.equal(
        validUploadRequest(upload({ fileMetadata })),
        false,
        `accepted metadata ${JSON.stringify(fileMetadata)}`
      );
    }
  });

  it('rejects missing metadata, empty metadata and missing authorization', function() {
    assert.equal(validUploadRequest(upload({ fileMetadata: undefined })), false);
    assert.equal(validUploadRequest(upload({ fileMetadata: '' })), false);
    assert.equal(validUploadRequest(upload({ authorization: undefined })), false);
    assert.equal(validUploadRequest(upload({ authorization: '' })), false);
  });

  it('rejects metadata over the size cap', function() {
    const fileMetadata = 'x'.repeat(config.max_metadata_size + 1);
    assert.equal(validUploadRequest(upload({ fileMetadata })), false);
  });
});
