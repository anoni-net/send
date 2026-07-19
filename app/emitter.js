/*
 * Replaces nanobus, which pulled nanotiming, nanoscheduler and nanoassert into
 * the bundle to provide performance marks that are disabled in production.
 *
 * The whole API in use across the app is on(), emit() and one
 * removeAllListeners() call, checked by grep over app/, server/ and test/:
 * 16 on, 20 emit, 1 removeAllListeners, and no wildcard ('*') listeners.
 *
 * Behaviour kept identical to nanobus where it is observable:
 *   - emit is synchronous; listeners run in registration order
 *   - listeners are called with `this` bound to the listener itself, which is
 *     what `listener.apply(listener, data)` did. No listener here relies on it,
 *     but changing it silently would be the kind of difference that only shows
 *     up in someone else's fork.
 *   - on/emit/removeAllListeners all return `this`; controller.js has two
 *     `return emitter.emit(...)` call sites.
 *
 * One deliberate difference: emit iterates over a copy of the listener array.
 * nanobus captured `arr.length` up front, so removing a listener during an emit
 * made it index past the end and call `undefined`. Nothing here removes
 * listeners during an emit, and a copy is the sane behaviour if anything ever
 * does.
 */
module.exports = class Emitter {
  constructor() {
    this._listeners = {};
  }

  on(eventName, listener) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(listener);
    return this;
  }

  emit(eventName, ...args) {
    const listeners = this._listeners[eventName];
    if (listeners && listeners.length > 0) {
      for (const listener of listeners.slice()) {
        listener.apply(listener, args);
      }
    }
    return this;
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this._listeners[eventName] = [];
    } else {
      this._listeners = {};
    }
    return this;
  }
};
