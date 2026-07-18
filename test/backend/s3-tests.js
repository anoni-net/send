const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

// Command stand-ins that just capture their input so assertions can inspect
// what the storage layer sent.
class FakeCommand {
  constructor(input) {
    this.input = input;
  }
}
class HeadObjectCommand extends FakeCommand {}
class GetObjectCommand extends FakeCommand {}
class DeleteObjectCommand extends FakeCommand {}
class HeadBucketCommand extends FakeCommand {}

let sendStub;
const clientInstance = { send: (...args) => sendStub(...args) };

let uploadArgs;
let uploadDone;
let uploadAbort;
class Upload {
  constructor(args) {
    uploadArgs = args;
    this.done = () => uploadDone();
    this.abort = uploadAbort;
  }
}

const S3Storage = proxyquire('../../server/storage/s3', {
  '@aws-sdk/client-s3': {
    S3Client: function() {
      return clientInstance;
    },
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand
  },
  '@aws-sdk/lib-storage': { Upload }
});

describe('S3Storage', function() {
  beforeEach(function() {
    sendStub = sinon.stub();
    uploadArgs = null;
    uploadDone = () => Promise.resolve();
    uploadAbort = sinon.stub();
  });

  it('uses config.s3_bucket', function() {
    const s = new S3Storage({ s3_bucket: 'foo' });
    assert.equal(s.bucket, 'foo');
  });

  describe('length', function() {
    it('returns the ContentLength', async function() {
      sendStub.resolves({ ContentLength: 123 });
      const s = new S3Storage({ s3_bucket: 'foo' });
      const len = await s.length('x');
      assert.equal(len, 123);
      const cmd = sendStub.firstCall.args[0];
      assert.ok(cmd instanceof HeadObjectCommand);
      assert.deepEqual(cmd.input, { Bucket: 'foo', Key: 'x' });
    });

    it('throws when id not found', async function() {
      const err = new Error();
      sendStub.rejects(err);
      const s = new S3Storage({ s3_bucket: 'foo' });
      try {
        await s.length('x');
        assert.fail();
      } catch (e) {
        assert.equal(e, err);
      }
    });
  });

  describe('getStream', function() {
    it('resolves to the object body', async function() {
      const stream = {};
      sendStub.resolves({ Body: stream });
      const s = new S3Storage({ s3_bucket: 'foo' });
      const result = await s.getStream('x');
      assert.equal(result, stream);
      const cmd = sendStub.firstCall.args[0];
      assert.ok(cmd instanceof GetObjectCommand);
      assert.deepEqual(cmd.input, { Bucket: 'foo', Key: 'x' });
    });
  });

  describe('set', function() {
    it('uploads with the right params', async function() {
      const file = { on: sinon.stub() };
      const s = new S3Storage({ s3_bucket: 'foo' });
      await s.set('x', file);
      assert.deepEqual(uploadArgs.params, {
        Bucket: 'foo',
        Key: 'x',
        Body: file
      });
      assert.equal(uploadArgs.client, clientInstance);
    });

    it('aborts the upload when the file stream errors', async function() {
      const file = { on: (ev, fn) => fn() };
      const err = new Error('limit');
      uploadDone = () => Promise.reject(err);
      const s = new S3Storage({ s3_bucket: 'foo' });
      try {
        await s.set('x', file);
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'limit');
        sinon.assert.calledOnce(uploadAbort);
      }
    });

    it('throws when the upload fails', async function() {
      const file = { on: sinon.stub() };
      const err = new Error();
      uploadDone = () => Promise.reject(err);
      const s = new S3Storage({ s3_bucket: 'foo' });
      try {
        await s.set('x', file);
        assert.fail();
      } catch (e) {
        assert.equal(e, err);
      }
    });
  });

  describe('del', function() {
    it('sends a DeleteObjectCommand', async function() {
      sendStub.resolves(true);
      const s = new S3Storage({ s3_bucket: 'foo' });
      const result = await s.del('x');
      assert.equal(result, true);
      const cmd = sendStub.firstCall.args[0];
      assert.ok(cmd instanceof DeleteObjectCommand);
      assert.deepEqual(cmd.input, { Bucket: 'foo', Key: 'x' });
    });
  });

  describe('ping', function() {
    it('sends a HeadBucketCommand', async function() {
      sendStub.resolves(true);
      const s = new S3Storage({ s3_bucket: 'foo' });
      const result = await s.ping();
      assert.equal(result, true);
      const cmd = sendStub.firstCall.args[0];
      assert.ok(cmd instanceof HeadBucketCommand);
      assert.deepEqual(cmd.input, { Bucket: 'foo' });
    });
  });
});
