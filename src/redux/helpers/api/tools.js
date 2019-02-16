import statusCode from 'statuscode';
import { addNotification } from '../../modules/notifications';
import { flatten } from 'flat';
import { canUseDOM } from 'exenv';

import { newPendingFetchOperation, completedFetchOperation } from '../../modules/app';
import { logout } from '../../modules/auth';
import { isTokenValid, decode } from '../../helpers/token';
import { safeGet } from '../../../helpers/common';

export const isTwoHundredCode = status => statusCode.accept(status, '2xx');
export const isServerError = status => statusCode.accept(status, '5xx');
export const isUnauthorized = status => status === 403;

export const getConfigVar = name => {
  var MY_VAR = '';
  if (canUseDOM) {
    MY_VAR = safeGet(window, ['__RECODEX_CONFIG__', name], '');
  } else {
    const fs = require('fs');
    MY_VAR = JSON.parse(fs.readFileSync('etc/env.json', 'utf8'))[name];
  }
  return MY_VAR;
};

export const API_BASE = getConfigVar('API_BASE');
export const URL_PATH_PREFIX = getConfigVar('URL_PATH_PREFIX') || '';

const maybeShash = endpoint => (endpoint.indexOf('/') === 0 ? '' : '/');
const getUrl = endpoint => API_BASE + maybeShash(endpoint) + endpoint;

const maybeQuestionMark = (endpoint, query) =>
  Object.keys(query).length === 0 ? '' : endpoint.indexOf('?') === -1 ? '?' : '&';

const encodeQueryItem = (flatten, name, value) => {
  if (Array.isArray(value)) {
    // Encode array so PHP wrapper can decode it as array
    value.forEach(nestedValue => encodeQueryItem(flatten, `${name}[]`, nestedValue));
  } else if (typeof value === 'object') {
    // Encode object as associative array
    Object.keys(value).forEach(nestedName =>
      encodeQueryItem(flatten, `${name}[${encodeURIComponent(nestedName)}]`, value[nestedName])
    );
  } else {
    flatten.push(name + '=' + encodeURIComponent(value));
  }
};

const generateQuery = query => {
  const flatten = [];
  if (query) {
    Object.keys(query).forEach(name => encodeQueryItem(flatten, encodeURIComponent(name), query[name]));
  }
  return flatten.join('&');
};

export const assembleEndpoint = (endpoint, query = {}) =>
  endpoint + maybeQuestionMark(endpoint, query) + generateQuery(query);

export const flattenBody = body => {
  const flattened = flatten(body, { delimiter: ':' });
  body = {};

  Object.keys(flattened).map(key => {
    // 'a:b:c:d' => 'a[b][c][d]'
    const bracketedKey = key.replace(/:([^:$]+)/g, '[$1]');
    body[bracketedKey] = flattened[key];
  });

  return body;
};

const createFormData = body => {
  const data = new FormData();
  const flattened = flattenBody(body);
  for (let key in flattened) {
    data.append(key, flattened[key]);
  }
  return data;
};

const encodeBody = (body, method, encodeAsMultipart) => {
  if (method.toUpperCase() !== 'POST') {
    return undefined;
  }

  if (encodeAsMultipart) {
    return body ? createFormData(body) : undefined;
  } else {
    // otherwise we encode in JSON
    return JSON.stringify(body || []);
  }
};

let requestAbortController = canUseDOM && 'AbortController' in window ? new window.AbortController() : null;

export const createRequest = (endpoint, query = {}, method, headers, body, uploadFiles) =>
  fetch(getUrl(assembleEndpoint(endpoint, query)), {
    method,
    headers,
    body: encodeBody(body, method, uploadFiles),
    signal: requestAbortController && requestAbortController.signal,
  });

export const abortAllPendingRequests = () => {
  if (requestAbortController) {
    requestAbortController.abort();
  }
  requestAbortController = canUseDOM && 'AbortController' in window ? new window.AbortController() : null;
};

export const getHeaders = (headers, accessToken, skipContentType) => {
  const usedHeaders = skipContentType ? headers : { 'Content-Type': 'application/json', ...headers };
  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
      ...usedHeaders,
    };
  }

  return usedHeaders;
};

/**
 * Create a request and setup the processing of the response.
 * @param {Object} request The request settings and data
 * @param {Function} dispatch The dispatch method
 */
export const createApiCallPromise = (
  {
    endpoint,
    query = {},
    method = 'GET',
    headers = {},
    accessToken = '',
    body = undefined,
    wasSuccessful = () => true,
    doNotProcess = false,
    uploadFiles = false,
  },
  dispatch = undefined
) => {
  let call = createRequest(endpoint, query, method, headers, body, uploadFiles)
    .catch(err => detectUnreachableServer(err, dispatch))
    .then(res => {
      canUseDOM && dispatch(completedFetchOperation());
      if (res.status === 401 && !isTokenValid(decode(accessToken)) && dispatch) {
        dispatch(logout('/'));
        dispatch(
          addNotification('Your session expired and you were automatically logged out of the ReCodEx system.', false)
        );
        return Promise.reject(res);
      }

      return res;
    });

  canUseDOM && dispatch(newPendingFetchOperation());

  // this processing can be manually skipped
  return doNotProcess === true ? call : processResponse(call, dispatch);
};

/**
 * A specific error means that there is a problem with the Internet connectin or the server is down.
 * @param {Object} err The error description
 * @param {Function} dispatch
 */
const detectUnreachableServer = (err, dispatch) => {
  canUseDOM && dispatch(completedFetchOperation());
  if (err.message && err.message === 'Failed to fetch') {
    dispatch(addNotification('The API server is unreachable. Please check your Internet connection.', false));
  } else {
    throw err;
  }
};

/**
 * Process the standardized formatof the response.
 * @param {Promise} call
 * @param {Function} dispatch
 * @returns {Promise}
 */
const processResponse = (call, dispatch) =>
  call
    .then(res => res.json())
    .then(({ success = true, code, msg = '', payload = {} }) => {
      if (!success) {
        dispatch && dispatch(addNotification(`Server response: ${msg}`, false));
        return Promise.reject(new Error('The API call was not successful.'));
      } else {
        return Promise.resolve(payload);
      }
    });
