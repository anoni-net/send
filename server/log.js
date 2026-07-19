const conf = require('./config');

const isProduction = conf.env === 'production';

// Replaces mozlog, which reached us through `intel` and called util.isError,
// removed in Node 23. That blocked moving the base image past Node 22, and it
// did not merely warn: mozlog throws the moment it formats a record on a
// current Node.
//
// The whole surface in use was log.info and log.error across five call sites,
// so this is written out rather than swapped for another logging framework.
//
// Production emits one JSON object per line, which any aggregator can read and
// `docker logs` still shows. The previous 'heka' format existed for Mozilla's
// pipeline and nothing consumes it here.

const LEVELS = { error: 50, warn: 40, info: 30, debug: 20 };
const threshold = isProduction ? LEVELS.info : LEVELS.debug;

// Errors do not survive JSON.stringify: it yields {}. This is what mozlog used
// util.isError for, and getting it wrong means an error log with no error in it.
function serialise(value) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function formatForHumans(value) {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(serialise(value));
  } catch (e) {
    return '[unserialisable]';
  }
}

function write(level, name, message, extra) {
  if (LEVELS[level] < threshold) return;
  const stream = LEVELS[level] >= LEVELS.error ? process.stderr : process.stdout;
  try {
    if (isProduction) {
      const record = {
        time: new Date().toISOString(),
        level,
        logger: name,
        message: String(message)
      };
      if (extra !== undefined) {
        record.detail = serialise(extra);
      }
      stream.write(JSON.stringify(record) + '\n');
    } else {
      const detail = extra === undefined ? '' : ' ' + formatForHumans(extra);
      stream.write(`${level.toUpperCase()} ${name} ${message}${detail}\n`);
    }
  } catch (e) {
    // A logger must not be able to take down the request that called it. Four
    // of the five call sites are already inside a catch block.
    try {
      stream.write(`ERROR ${name} log record could not be written\n`);
    } catch (ignored) {
      // nothing sensible left to do
    }
  }
}

module.exports = function(name) {
  return {
    error: (message, extra) => write('error', name, message, extra),
    warn: (message, extra) => write('warn', name, message, extra),
    info: (message, extra) => write('info', name, message, extra),
    debug: (message, extra) => write('debug', name, message, extra)
  };
};
