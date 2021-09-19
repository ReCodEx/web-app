import { getConfigVar } from './config';

const PERSISTENT_TOKENS_KEY_PREFIX = (getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recodex') + '/';

/**
 * Test whether local storage is available to us (i.e., we are on a client).
 * @returns
 */
const localStorageAvailable = () => {
  if (
    !window ||
    !('localStorage' in window) ||
    !('getItem' in window.localStorage) ||
    !('setItem' in window.localStorage) ||
    !('removeItem' in window.localStorage)
  ) {
    return false;
  }

  // source https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  try {
    const testVal = '__storage_test__';
    window.localStorage.setItem(testVal, testVal);
    window.localStorage.removeItem(testVal);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      window.localStorage.length !== 0
    );
  }
};

/**
 * Wrapper for local storage writer.
 * @param {string} key
 * @param {*} value value must be serializabe into JSON; if null or undedined is passed, the item is removed
 */
export const storageSetItem = (key, value) => {
  const prefixedKey = `${PERSISTENT_TOKENS_KEY_PREFIX}${key}`;
  if (localStorageAvailable()) {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(prefixedKey);
    } else {
      window.localStorage.setItem(prefixedKey, JSON.stringify(value));
    }
  }
};

/**
 * Wrapper for local storage reader.
 * @param {string} key
 * @param {*} defaultValue which is returned if no value is stored in storage
 * @returns {*} previously stored value
 */
export const storageGetItem = (key, defaultValue = undefined) => {
  if (!localStorageAvailable()) {
    return defaultValue;
  }

  const prefixedKey = `${PERSISTENT_TOKENS_KEY_PREFIX}${key}`;
  const serialized = window.localStorage.getItem(prefixedKey);
  return serialized === null ? defaultValue : JSON.parse(serialized);
};

/**
 * Remove item from local storage.
 * @param {string} key
 */
export const storageRemoveItem = key => {
  if (localStorageAvailable()) {
    const prefixedKey = `${PERSISTENT_TOKENS_KEY_PREFIX}${key}`;
    window.localStorage.removeItem(prefixedKey);
  }
};

// list of registered listeners
let listenerCounter = 0;
const listeners = {};

const listenKeyMatch = (eventKey, key) =>
  key ? eventKey === `${PERSISTENT_TOKENS_KEY_PREFIX}${key}` : eventKey.startsWith(PERSISTENT_TOKENS_KEY_PREFIX);

/**
 * Register callback which is triggered when the value is changed in local storage.
 * @param {string|null} key which changes are observerd, null to observe all changes
 * @param {Function} callback invoked with every change: (newVal [, oldVal [, key]]) => {}
 * @returns {string|null} identifier of the listener, null if no listener was registered
 */
export const listenForChanges = (key, callback) => {
  if (!localStorageAvailable()) {
    return null;
  }

  const id = `${++listenerCounter}.${key || '*'}`;
  const listener = ev => {
    if (listenKeyMatch(ev.key, key) && ev.newValue !== ev.oldValue) {
      const newValue = ev.newValue && JSON.parse(ev.newValue);
      const oldValue = ev.oldValue && JSON.parse(ev.oldValue);
      callback(newValue, oldValue, ev.key.substr(PERSISTENT_TOKENS_KEY_PREFIX.length));
    }
  };
  window.addEventListener('storage', listener);
  listeners[id] = listener;
};

/**
 * Unregister listener by its ID
 * @param {string|null} id previously returned from listenForChanges
 */
export const removeListener = id => {
  if (id && localStorageAvailable()) {
    const listener = listeners[id];
    if (listener) {
      delete listeners[id];
      window.removeEventListener('storage', listener);
    }
  }
};
