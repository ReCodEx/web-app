import statusCode from 'statuscode';
import { addNotification } from '../../modules/notifications';
import flatten from 'flat';

export const isTwoHundredCode = status => statusCode.accept(status, '2xx');
export const isServerError = status => statusCode.accept(status, '5xx');
export const isUnauthorized = status => status === 403;

export const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';

const maybeShash = endpoint => (endpoint.indexOf('/') === 0 ? '' : '/');
const getUrl = endpoint => API_BASE + maybeShash(endpoint) + endpoint;

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

const maybeQuestionMark = (endpoint, query) =>
  Object.keys(query).length === 0
    ? ''
    : endpoint.indexOf('?') === -1 ? '?' : '&';

const generateQuery = query =>
  !query ? '' : Object.keys(query).map(key => `${key}=${query[key]}`).join('&');

export const assembleEndpoint = (endpoint, query = {}) =>
  endpoint + maybeQuestionMark(endpoint, query) + generateQuery(query);

export const createRequest = (endpoint, query = {}, method, headers, body) =>
  fetch(getUrl(assembleEndpoint(endpoint, query)), {
    method,
    headers,
    body: body ? createFormData(body) : undefined
  });

export const getHeaders = (headers, accessToken) => {
  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
      ...headers
    };
  }

  return headers;
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
    body = undefined,
    wasSuccessful = () => true,
    doNotProcess = false
  },
  dispatch = undefined
) => {
  let call = createRequest(endpoint, query, method, headers, body).catch(err =>
    detectUnreachableServer(err, dispatch)
  );

  // this processing can be manually skipped
  return doNotProcess === true ? call : processResponse(call, dispatch);
};

/**
 * A specific error means that there is a problem with the Internet connectin or the server is down.
 * @param {Object} err The error description
 * @param {Function} dispatch
 */
const detectUnreachableServer = (err, dispatch) => {
  if (err.message && err.message === 'Failed to fetch') {
    dispatch(
      addNotification(
        'The API server is unreachable. Please check your Internet connection.',
        false
      )
    );
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
