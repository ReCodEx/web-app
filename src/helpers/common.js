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

/**
 * Safe way how to insert value in complex object/array structure (constructing the nested objects/arrays as necessary).
 * String path values represent object keys, numbers are array indices.
 */
export const safeSet = (obj, path, value) => {
  if (!obj || !Array.isArray(path)) {
    throw new Error('The safeSet method expects there is a nonempty object/array with nonempty path given.');
  }

  // Find the target entity, construct the path if necessary.
  let prevStep = null;
  path
    .filter(step => step !== null)
    .forEach(step => {
      if (prevStep !== null) {
        if (obj[prevStep] === undefined) {
          obj[prevStep] = Number.isInteger(step) ? [] : {};
        }
        obj = obj[prevStep];
      }
      prevStep = step;
    });

  // Prev step is the last step after the foreach.
  if (prevStep !== null) {
    obj[prevStep] = value;
  }
};

/*
 * IDs Management
 */
export const encodeId = id => {
  return 'BID' + btoa(id);
};

export const encodeNumId = id => {
  return 'ID' + id;
};

/*
 * Array Helpers
 */

/**
 * Create numeric index range [start, end). If start > end, the range goes in descending order from start to end-1.
 * @param {*} start
 * @param {*} end
 */
export const range = (start, end) =>
  start < end
    ? [...Array(end - start).keys()].map(i => i + start)
    : [...Array(start - end).keys()].map(i => i + end + 1).reverse();

// Gets an array and returns array with unique items.
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

/**
 * Implementation of map() function for objects.
 * Create a copy of an object where each value is transformed using given function.
 * @param {object} obj Object being copied (used as template).
 * @param {function} fnc Mapping function for values
 */
export const objectMap = (obj, fnc) => {
  const res = {};
  for (const key in obj) {
    res[key] = fnc(obj[key], key);
  }
  return res;
};

const idSelector = obj => obj.id;

/**
 * Convert array into object. Values of the array remain the values of the object.
 * Keys are computed from values using indexer function
 * (by default, the indexer assumes the values are objects and attempts to fetch "id" property).
 * Optionally, a mapper function can be provided. Mapper is applied on every value.
 */
export const arrayToObject = (arr, indexer = idSelector, mapper = identity) =>
  arr.reduce((res, val, idx) => {
    res[indexer(val, idx)] = mapper(val);
    return res;
  }, {});

// This is default comparator which is written based on the default behavior of default sort.
const _defaultComparator = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (b === undefined) {
    return -1;
  }
  if (a === undefined) {
    return 1;
  }
  return String(a).localeCompare(String(b));
};

/**
 * Get the first (the smallest) item of ordered array without actually sorting it.
 * @param {array} arr The array to be searched.
 * @param {function} comparator Comparator that determines ordering. Same as in case of sort() method.
 * @return Smallest (the first) item of the array in given ordering.
 */
export const getFirstItemInOrder = (arr, comarator = _defaultComparator) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return null;
  }

  let res = arr[0];
  arr.forEach((item, idx) => {
    if (idx > 0 && comarator(res, item) > 0) {
      res = item;
    }
  });
  return res;
};

/*
 * Function Helpers
 */

/**
 * Memoize wrapper for functions with single scalar argument.
 * The function may have more than one argument, but only the first one is caching key.
 */
export const simpleScalarMemoize = fnc => {
  const cache = {};
  return (key, ...rest) => {
    if (!(key in cache)) {
      cache[key] = fnc(key, ...rest);
    }
    return cache[key];
  };
};

/*
 * ACL Helpers
 */

/**
 * Check whether given entity has all specified permissions.
 * @param {object} entity The entity loaded from API which is augmented with permissionHints.
 * @param fields The rest of the arguments are permission names -- fields in permissionHints.
 */
export const hasPermissions = (entity, ...fields) => {
  if (!entity || fields.length === 0) {
    return false;
  }
  return fields.reduce((acc, field) => acc && Boolean(safeGet(entity, ['permissionHints', field], false)), true);
};

/**
 * Check whether given entity has at least one of the specified permissions.
 * @param {object} entity The entity loaded from API which is augmented with permissionHints.
 * @param fields The rest of the arguments are permission names -- fields in permissionHints.
 */
export const hasOneOfPermissions = (entity, ...fields) => {
  if (!entity || fields.length === 0) {
    return false;
  }
  return fields.reduce((acc, field) => acc || Boolean(safeGet(entity, ['permissionHints', field], false)), false);
};
