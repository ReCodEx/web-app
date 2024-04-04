import { List, Map } from 'immutable';
import { Buffer } from 'buffer';

export const EMPTY_ARRAY = [];
export const EMPTY_OBJ = {};
export const EMPTY_LIST = List();
export const EMPTY_MAP = Map();

export const EMPTY_FNC = () => {};
export const identity = x => x;

/**
 * Safe getter to traverse compex object/array structures.
 * @param {*} obj the root of the structure being traversed (object, array)
 * @param {Array} path sequence of steps, each step is either an explicit key or a function;
 *                     function can be only used in arrays and they are applied as .find() callbacks
 * @param {*} def default value, which is returned if the path does not exist in obj structure
 */
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
 * String and related (ID management) functions
 */
export const toPlainAscii = str => str && str.normalize('NFD').replace(/[^-_a-zA-Z0-9.()[\] ]/g, '');

export const encodeId = id => {
  return 'BID' + Buffer.from(id).toString('base64');
};

export const encodeNumId = id => {
  return 'ID' + id;
};

export const getFileExtension = fileName => fileName.split('.').pop();

export const getFileExtensionLC = fileName => getFileExtension(fileName).toLowerCase();

export const urlQueryString = obj =>
  Object.keys(obj)
    .filter(name => obj[name])
    .map(name => `${name}=${encodeURIComponent(obj[name])}`)
    .join('&');

/*
 * Numeric stuff
 */
export const sum = (arr, mapper = identity) => arr.map(mapper).reduce((a, b) => a + b, 0);
export const avg = (arr, mapper = identity) => (arr.length > 0 ? sum(arr, mapper) / arr.length : NaN);

/*
 * Array/Object Helpers
 */

/**
 * Check whether given value is a regular object, but not array nor null.
 * @param {*} obj value to be tested
 * @returns {boolean}
 */
export const isRegularObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

/**
 * Check whether given object is an empty object {}.
 * @param {*} obj
 */
export const isEmptyObject = obj => Object.keys(obj).length === 0;

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

/**
 * Search object by values and return corresponding key.
 * @param {Object} obj object to be searched
 * @param {*} predicate either a value being searched or a function that tests each value and returns true if match is found
 * @returns {string|number} key of the first matchinng value (beware the order of search is implementation specific)
 */
export const objectFind = (obj, predicate) =>
  Object.keys(obj).find(typeof predicate === 'function' ? key => predicate(obj[key]) : key => obj[key] === predicate);

const idSelector = obj => obj.id;

/**
 * Similar to array.filter, but applied on an object.
 * @param {Object} obj to be filtered
 * @param {Function} predicate called on every entry, returns true should the entry remain
 * @returns {Object} clone of obj with entries filtered out
 */
export const objectFilter = (obj, predicate = val => Boolean(val)) => {
  const res = {};
  Object.keys(obj)
    .filter(key => predicate(obj[key], key))
    .forEach(key => (res[key] = obj[key]));
  return res;
};

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

/**
 * Compare two entities (scalars, arrays, or objects). In case of arrays and objects,
 * the items/properties are compared with strict '==='.
 * @param {*} a
 * @param {*} b
 * @returns {boolean} true if the values are equal
 */
export const shallowCompare = (a, b) => {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== 'object' || a === null || b === null) {
    return a === b; // compare scalars
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    // compare arrays
    return a.length === b.length ? a.every((val, idx) => val === b[idx]) : false;
  } else {
    // compare objects
    const aKeys = Object.keys(a);
    const bKeys = new Set(Object.keys(b));
    return aKeys.length === bKeys.size ? aKeys.every(key => bKeys.has(key) && a[key] === b[key]) : false;
  }
};

/**
 * Compare two entities (scalars, arrays, or objects). In case of arrays and objects,
 * the items/properties are compared recursively.
 * @param {*} a
 * @param {*} b
 * @param {boolean} emptyObjectArrayEquals if true, {} and [] are treated as equal
 * @returns {boolean} true if the values are equal
 */
export const deepCompare = (a, b, emptyObjectArrayEquals = false) => {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== 'object' || a === null || b === null) {
    return a === b; // compare scalars
  } else if (emptyObjectArrayEquals && Object.keys(a).length === 0 && Object.keys(b).length === 0) {
    return true; // special case, empty objects are compared regardless of their prototype
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    // compare arrays
    return a.length === b.length ? a.every((val, idx) => deepCompare(val, b[idx], emptyObjectArrayEquals)) : false;
  } else {
    // compare objects
    const aKeys = Object.keys(a);
    const bKeys = new Set(Object.keys(b));
    return aKeys.length === bKeys.size
      ? aKeys.every(key => bKeys.has(key) && deepCompare(a[key], b[key], emptyObjectArrayEquals))
      : false;
  }
};

// default deepReduce reductor that appends everything into an array
const _deepReduceArrayReductor = (acc, val) => [...acc, val];

/**
 * Performs a deep reduce using similar approach like safeGet -- exploring given data structure using path descriptor.
 * @param {*} obj root of the structure being explored
 * @param {Array} path sequence of steps within the data structure where individual steps have the following semantics:
 *                     numbers and strings are keys (in object/arrays), functions are used as .find() callbacks,
 *                     null works as asterisk (foreach loop at given level)
 * @param {Function} reductor callback with almost the same args as in Array.reduce(),
 *                            but it only gets accumulator and reduced value
 * @param {*} initialValue for the reduction
 */
export const deepReduce = (obj, path, reductor = _deepReduceArrayReductor, initialValue = []) => {
  if (path.length === 0) {
    // end of the path -- let's reduce!
    return reductor(initialValue, obj);
  }

  if (typeof obj !== 'object') {
    return initialValue; // obj is not an object, but we need to go deeper -> path does not exist
  }

  const [step, ...restPath] = path;

  if (step === null) {
    // null is an asterisk, reduce over all sub-items
    let res = initialValue;
    Object.values(obj).forEach(nested => {
      res = deepReduce(nested, restPath, reductor, res);
    });
    return res;
  } else {
    // perform just one step
    if (typeof step === 'function') {
      if (!Array.isArray(obj)) {
        return initialValue; // function can be only applied on arrays in .find() callback
      }
      obj = obj.find(step);
    } else {
      obj = obj[step];
    }
    return deepReduce(obj, restPath, reductor, initialValue);
  }
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

/**
 * Compose a sequence of unary functions (composeFunctions(f, g) will create x => f(g(x))).
 * @param {Function} fnc
 * @param  {Function[]} rest
 * @returns {Function}
 */
export const composeFunctions = (fnc, ...rest) => {
  if (rest.length === 0) {
    return fnc;
  }

  const innerFnc = composeFunctions(...rest);
  return arg => fnc(innerFnc(arg));
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
