const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const storage = {
  setFields: sinon.stub()
};

function request(id, body) {
  return {
    params: { id },
    body
  };
}

function response() {
  return {
    sendStatus: sinon.stub()
  };
}

const passwordRoute = proxyquire('../../server/routes/password', {
  '../storage': storage,
  '../log': () => ({ info() {}, error() {} })
});

describe('/api/password', function() {
  afterEach(function() {
    storage.setFields.reset();
  });

  it('writes auth and pwd in one call', async function() {
    // One call rather than two, so the pair cannot land half-applied: a record
    // with `auth` but no `pwd` makes /api/exists answer requiresPassword:false,
    // and the recipient's client then loops on 401 without ever prompting.
    storage.setFields.resolves(1);
    const req = request('x', { auth: 'z' });
    const res = response();
    await passwordRoute(req, res);
    sinon.assert.calledOnce(storage.setFields);
    sinon.assert.calledWith(storage.setFields, 'x', { auth: 'z', pwd: true });
    sinon.assert.calledWith(res.sendStatus, 200);
  });

  it('sends a 400 if auth is missing', async function() {
    const req = request('x', {});
    const res = response();
    await passwordRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 400);
  });

  it('sends a 404 when the record is already gone', async function() {
    storage.setFields.resolves(-1);
    const req = request('x', { auth: 'z' });
    const res = response();
    await passwordRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 404);
  });

  it('sends a 500 when the write fails', async function() {
    // The sender is told the file is protected only when it actually is. With
    // the write un-awaited and its rejection swallowed, a redis outage answered
    // 200 and left the file downloadable by anyone holding the link.
    storage.setFields.rejects(new Error('redis down'));
    const req = request('x', { auth: 'z' });
    const res = response();
    await passwordRoute(req, res);
    sinon.assert.calledWith(res.sendStatus, 500);
  });
});
