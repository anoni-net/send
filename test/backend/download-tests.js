const assert = require('assert');
const sinon = require('sinon');
const { Readable, Writable } = require('stream');
const proxyquire = require('proxyquire').noCallThru();

const storage = {
  reserveDownload: sinon.stub(),
  releaseDownload: sinon.stub(),
  length: sinon.stub(),
  get: sinon.stub(),
  del: sinon.stub()
};

const downloadRoute = proxyquire('../../server/routes/download', {
  '../storage': storage,
  '../log': () => ({ info() {}, error() {} })
});

function request(id, meta) {
  return { params: { id }, meta };
}

// A real Writable so stream.pipeline drives genuine finish/error/close
// semantics, plus the two express helpers the route calls.
function response() {
  const res = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    }
  });
  res.statusCode = null;
  res.writeHead = sinon.stub().callsFake(code => {
    res.statusCode = code;
  });
  res.sendStatus = sinon.stub().callsFake(code => {
    res.statusCode = code;
  });
  return res;
}

// Resolves the next time `stub` is called, so a test can await the pipeline
// completion callback (which fires after the route function has returned).
function calledOnce(stub) {
  return new Promise(resolve => {
    stub.callsFake(async () => resolve());
  });
}

function tick() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('/api/download', function() {
  beforeEach(function() {
    for (const s of Object.values(storage)) s.reset();
    storage.releaseDownload.resolves(0);
    storage.del.resolves();
    storage.length.resolves(10);
  });

  it('404s without streaming when the record is already gone', async function() {
    storage.reserveDownload.resolves(-1);
    const res = response();
    await downloadRoute(request('x', { dlimit: 1 }), res);
    assert.equal(res.statusCode, 404);
    sinon.assert.notCalled(storage.get);
    sinon.assert.notCalled(storage.releaseDownload);
  });

  it('refuses and releases the slot when over the limit', async function() {
    storage.reserveDownload.resolves(2); // dlimit is 1
    const res = response();
    await downloadRoute(request('x', { dlimit: 1 }), res);
    assert.equal(res.statusCode, 404);
    sinon.assert.calledWith(storage.releaseDownload, 'x');
    sinon.assert.notCalled(storage.get);
    sinon.assert.notCalled(storage.del);
  });

  it('serves and deletes the file when it takes the final slot', async function() {
    storage.reserveDownload.resolves(1); // dlimit 1 -> this is the last slot
    storage.get.resolves(Readable.from([Buffer.alloc(10)]));
    const deleted = calledOnce(storage.del);
    const res = response();
    await downloadRoute(request('x', { dlimit: 1 }), res);
    await deleted;
    assert.equal(res.statusCode, 200);
    sinon.assert.calledWith(storage.del, 'x');
    sinon.assert.notCalled(storage.releaseDownload);
  });

  it('serves without deleting when slots remain', async function() {
    storage.reserveDownload.resolves(1); // dlimit 3 -> not the last slot
    storage.get.resolves(Readable.from([Buffer.alloc(10)]));
    const res = response();
    await downloadRoute(request('x', { dlimit: 3 }), res);
    await tick();
    await tick();
    assert.equal(res.statusCode, 200);
    sinon.assert.notCalled(storage.del);
    sinon.assert.notCalled(storage.releaseDownload);
  });

  it('releases the slot when the stream fails midway', async function() {
    storage.reserveDownload.resolves(1);
    const failing = new Readable({
      read() {
        this.destroy(new Error('disk fail'));
      }
    });
    storage.get.resolves(failing);
    const released = calledOnce(storage.releaseDownload);
    const res = response();
    await downloadRoute(request('x', { dlimit: 1 }), res);
    await released;
    sinon.assert.calledWith(storage.releaseDownload, 'x');
    sinon.assert.notCalled(storage.del);
  });

  it('releases the slot and 404s when storage errors before streaming', async function() {
    storage.reserveDownload.resolves(1);
    storage.get.rejects(new Error('boom'));
    const res = response();
    await downloadRoute(request('x', { dlimit: 1 }), res);
    assert.equal(res.statusCode, 404);
    sinon.assert.calledWith(storage.releaseDownload, 'x');
    sinon.assert.notCalled(storage.del);
  });
});
