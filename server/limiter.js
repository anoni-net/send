const { Transform } = require('stream');

// Distinguishable, because routes/ws.js decides between 413 and 500 from it.
// The limiter signalled with a bare Error('limit') and the route compared
// `e === 'limit'`, a string against an object, so that comparison was never
// true and every over-size upload came back as a server error. Third-party API
// clients such as ffsend read the status, so they were told the server had
// broken rather than that the file was too big.
class LimitError extends Error {
  constructor(length, limit) {
    super('limit');
    this.name = 'LimitError';
    this.length = length;
    this.limit = limit;
  }
}

class Limiter extends Transform {
  constructor(limit) {
    super();
    this.limit = limit;
    this.length = 0;
  }

  _transform(chunk, encoding, callback) {
    this.length += chunk.length;
    this.push(chunk);
    if (this.length > this.limit) {
      // The numbers travel on the error and are logged once by the route, in
      // the structured format. This was a console.error written here, outside
      // the logger, and reachable by any unauthenticated client.
      return callback(new LimitError(this.length, this.limit));
    }
    callback();
  }
}

module.exports = Limiter;
module.exports.LimitError = LimitError;
