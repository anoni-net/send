const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const storage = {
  setField: sinon.stub()
};

function request(id) {
  return {
    params: { id },
    body: {}
  };
}

function response() {
  return {
    sendStatus: sinon.stub()
  };
}

const paramsRoute = proxyquire('../../server/routes/params', {
  '../storage': storage,
  '../log': () => ({ info() {}, error() {} })
});

describe('/api/params', function() {
  afterEach(function() {
    storage.setField.reset();
  });

  it('calls storage.setField with the correct parameter', async function() {
    storage.setField.resolves(1);
    const req = request('x');
    const dlimit = 2;
    req.body.dlimit = dlimit;
    const res = response();
    await paramsRoute(req, res);
    sinon.assert.calledWith(storage.setField, 'x', 'dlimit', dlimit);
    sinon.assert.calledWith(res.sendStatus, 200);
  });

  it('sends a 400 if dlimit is too large', async function() {
    const req = request('x');
    const res = response();
    req.body.dlimit = 201;
    await paramsRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 400);
  });

  it('sends a 404 when the record is already gone', async function() {
    // setField answers -1 rather than recreating a TTL-less hash, so the route
    // has a failure to report. Before it awaited, this was 200.
    storage.setField.resolves(-1);
    const req = request('x');
    const res = response();
    req.body.dlimit = 2;
    await paramsRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 404);
  });

  it('sends a 500 when the write fails', async function() {
    storage.setField.rejects(new Error('redis down'));
    const req = request('x');
    const res = response();
    req.body.dlimit = 2;
    await paramsRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 500);
  });
});
