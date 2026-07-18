const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

// gcs.js constructs `new Storage()` at module scope and calls storage.bucket()
// in the constructor, so the stub resolves the current bucket lazily.
let bucketStub;
let requestedBucketName;

const GCSStorage = proxyquire('../../server/storage/gcs', {
  '@google-cloud/storage': {
    Storage: function() {
      return {
        bucket: name => {
          requestedBucketName = name;
          return bucketStub;
        }
      };
    }
  }
});

function makeFileStub() {
  return {
    getMetadata: sinon.stub(),
    createReadStream: sinon.stub(),
    createWriteStream: sinon.stub(),
    delete: sinon.stub()
  };
}

describe('GCSStorage', function() {
  let fileStub;

  beforeEach(function() {
    fileStub = makeFileStub();
    requestedBucketName = null;
    bucketStub = {
      file: sinon.stub().returns(fileStub),
      exists: sinon.stub()
    };
  });

  it('uses config.gcs_bucket', function() {
    new GCSStorage({ gcs_bucket: 'foo' });
    assert.equal(requestedBucketName, 'foo');
  });

  describe('length', function() {
    it('returns the metadata size', async function() {
      fileStub.getMetadata.resolves([{ size: 123 }]);
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      const len = await s.length('x');
      assert.equal(len, 123);
      sinon.assert.calledWith(bucketStub.file, 'x');
    });

    it('throws when the object is missing', async function() {
      const err = new Error();
      fileStub.getMetadata.rejects(err);
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      try {
        await s.length('x');
        assert.fail();
      } catch (e) {
        assert.equal(e, err);
      }
    });
  });

  describe('getStream', function() {
    it('returns a read stream with validation disabled', function() {
      const stream = {};
      fileStub.createReadStream.returns(stream);
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      assert.equal(s.getStream('x'), stream);
      sinon.assert.calledWith(bucketStub.file, 'x');
      sinon.assert.calledWithMatch(fileStub.createReadStream, {
        validation: false
      });
    });
  });

  describe('set', function() {
    function pipeable() {
      const handlers = {};
      const piped = {
        on: (ev, fn) => {
          handlers[ev] = fn;
          return piped;
        }
      };
      return { handlers, file: { pipe: sinon.stub().returns(piped) } };
    }

    it('resolves when the upload finishes', async function() {
      const writeStream = {};
      fileStub.createWriteStream.returns(writeStream);
      const { handlers, file } = pipeable();
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      const result = s.set('x', file);
      handlers.finish();
      await result;
      sinon.assert.calledWith(file.pipe, writeStream);
      sinon.assert.calledWithMatch(fileStub.createWriteStream, {
        validation: false,
        resumable: true
      });
    });

    it('rejects when the upload errors', async function() {
      fileStub.createWriteStream.returns({});
      const { handlers, file } = pipeable();
      const err = new Error('boom');
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      const result = s.set('x', file);
      handlers.error(err);
      try {
        await result;
        assert.fail();
      } catch (e) {
        assert.equal(e, err);
      }
    });
  });

  describe('del', function() {
    it('deletes the file', async function() {
      fileStub.delete.resolves(true);
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      const result = await s.del('x');
      assert.equal(result, true);
      sinon.assert.calledWith(bucketStub.file, 'x');
    });
  });

  describe('ping', function() {
    it('checks that the bucket exists', async function() {
      bucketStub.exists.resolves(true);
      const s = new GCSStorage({ gcs_bucket: 'foo' });
      const result = await s.ping();
      assert.equal(result, true);
      sinon.assert.calledOnce(bucketStub.exists);
    });
  });
});
