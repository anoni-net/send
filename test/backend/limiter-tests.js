const assert = require('assert');

const Limiter = require('../../server/limiter');

// Feed the transform and resolve with whatever it produced, or reject with the
// error it signalled. This is the shape storage.set() sees.
function drain(limiter, chunks) {
  return new Promise((resolve, reject) => {
    const out = [];
    limiter.on('data', c => out.push(c));
    limiter.on('end', () => resolve(Buffer.concat(out)));
    limiter.on('error', reject);
    for (const c of chunks) {
      limiter.write(c);
    }
    limiter.end();
  });
}

describe('Limiter', function() {
  it('passes bytes through up to the limit', async function() {
    const out = await drain(new Limiter(10), [
      Buffer.from('12345'),
      Buffer.from('67890')
    ]);
    assert.equal(out.toString(), '1234567890');
  });

  it('signals a LimitError carrying the numbers', async function() {
    // routes/ws.js maps this to 413. It used to be a bare Error('limit')
    // compared against the string 'limit', which is never equal, so the 413
    // branch was unreachable and every over-size upload answered 500. The
    // length and the limit ride on the error so the route can log them once in
    // the structured format, replacing a console.error any unauthenticated
    // client could drive.
    const err = await drain(new Limiter(4), [Buffer.from('123456')]).then(
      () => null,
      e => e
    );

    assert.ok(err instanceof Limiter.LimitError);
    assert.equal(err.name, 'LimitError');
    assert.equal(err.length, 6);
    assert.equal(err.limit, 4);
  });

  it('allows exactly the limit', async function() {
    const out = await drain(new Limiter(4), [Buffer.from('1234')]);
    assert.equal(out.toString(), '1234');
  });
});
