/*
 * Replaces nanobus, which pulled nanotiming, nanoscheduler and nanoassert into
 * the bundle to provide performance marks that are disabled in production.
 *
 * The whole API in use across app/, server/, common/ and test/ is on() 34
 * times, emit() 21, once() 5 and removeAllListeners() once, with no wildcard
 * ('*') listeners. The once() calls are all in the frontend cancel tests, on
 * FileSender and FileReceiver.
 *
 * Behaviour kept identical to nanobus where it is observable:
 *   - emit is synchronous; listeners run in registration order
 *   - on() listeners are called with `this` bound to the listener itself, which
 *     is what `listener.apply(listener, data)` did, while once() listeners get
 *     `this` bound to the emitter. That inconsistency is nanobus's, and it is
 *     reproduced rather than tidied up: no listener here relies on either, but
 *     changing it silently would be the kind of difference that only shows up
 *     in someone else's fork.
 *   - once() runs the listener first and deregisters afterwards, in that order
 *   - every method returns `this`; controller.js has two
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

  once(eventName, listener) {
    const self = this;
    function wrapper(...args) {
      listener.apply(self, args);
      const listeners = self._listeners[eventName];
      if (listeners) {
        const i = listeners.indexOf(wrapper);
        if (i !== -1) listeners.splice(i, 1);
      }
    }
    return this.on(eventName, wrapper);
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
