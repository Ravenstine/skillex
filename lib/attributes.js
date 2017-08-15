'use strict';

// Track changes to attributes, or any object for that matter,
// so we can know when to make certain overrides.

module.exports = (object) => {
  let dirty = {};
  let proxy = new Proxy(object, {
    get: (object, key) => {
      return object[key];
    },
    set: (object, key, value, proxy) => {
      object[key] = value;
      dirty[key]  = value;
      return true;
    }
  });
  proxy.hasChanged = (k) => {
    return dirty.hasOwnProperty(k);
  }
  proxy.toJSON     = () => {
    let clone = Object.assign({}, object);
    delete clone.hasChanged;
    delete clone.toJSON;
    delete clone.reset;
    return clone;
  }
  proxy.reset      = () => {
    dirty = {};
  }
  return proxy;
}

