import { List, Map } from 'immutable';

export const EMPTY_ARRAY = [];
export const EMPTY_OBJ = {};
export const EMPTY_LIST = List();
export const EMPTY_MAP = Map();

export const EMPTY_FNC = () => {};
export const identity = x => x;

// Safe getter to traverse compex object/array structures.
export const safeGet = (obj, path, def = undefined) => {
  if (!Array.isArray(path)) {
    path = [path];
  }
  path.forEach(step => {
    obj = obj && (typeof step === 'function' ? obj.find(step) : obj[step]);
  });
  return obj === undefined ? def : obj;
};

export const encodeId = id => {
  return 'BID' + btoa(id);
};

export const encodeNumId = id => {
  return 'ID' + id;
};

export const unique = arr => [...new Set(arr)];

/**
 * Get an array of strings, return object where keys are that strings
 * and values are lists of indices refering to the positions in original array.
 */
export const createIndex = arr => {
  const index = {};
  arr.forEach((name, idx) => {
    if (index[name] === undefined) {
      index[name] = [idx];
    } else {
      index[name].push(idx);
    }
  });
  return index;
};
