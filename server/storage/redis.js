module.exports = function(config) {
  const redis = require('redis');

  // node-redis v4+ client options. Legacy v3 top-level host/port/retry_strategy
  // moved under `socket`, and command methods are promise-based (no promisify).
  const options = {
    socket: {
      host: config.redis_host,
      port: config.redis_port,
      reconnectStrategy: retries => {
        const delay = config.redis_retry_delay;
        if (retries * delay > config.redis_retry_time) {
          return new Error('Retry time exhausted');
        }
        return delay;
      }
    }
  };
  if (config.redis_user != null && config.redis_user.length > 0) {
    options.username = config.redis_user;
  }
  if (config.redis_password != null && config.redis_password.length > 0) {
    options.password = config.redis_password;
  }
  if (config.redis_db != null && config.redis_db.length > 0) {
    options.database = Number(config.redis_db);
  }

  const client = redis.createClient(options);

  // v4+ needs an explicit connect(). Commands issued before the connection is
  // ready are buffered on the offline queue and flushed once connected. A
  // no-op 'error' listener keeps a connection-level 'error' from throwing as an
  // unhandled event; the DB layer attaches its own 'error' handler for logging.
  client.on('error', () => {});
  client.connect().catch(() => {});

  return client;
};
