import statusCode from 'statuscode';
import { addNotification } from '../modules/notifications';
import flatten from 'flat';

export const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';
export const CALL_API = 'recodex-api/CALL';

const maybeShash = endpoint =>
  endpoint.indexOf('/') === 0 ? '' : '/';

const getUrl = endpoint =>
  API_BASE + maybeShash(endpoint) + endpoint;

const createFormData = (body) => {
  if (body) {
    const data = new FormData();
    const flattened = flatten(body, { delimiter: ':' });
    Object.keys(flattened).map(key => {
      const bracketedKey = key.replace(/:([^:$]+)/g, '[$1]'); // 'a:b:c:d' => 'a[b][c][d]'
      data.append(bracketedKey, flattened[key]);
    });
    return data;
  }
};

const maybeQuestionMark = (endpoint, query) =>
  Object.keys(query).length === 0
    ? ''
    : endpoint.indexOf('?') === -1 ? '?' : '&';

const generateQuery = query =>
  !query ? '' : Object.keys(query).map(key => `${key}=${query[key]}`).join('&');

export const assembleEndpoint = (endpoint, query = {}) =>
  endpoint + maybeQuestionMark(endpoint, query) + generateQuery(query);

const createRequest = (endpoint, query = {}, method, headers, body) =>
  fetch(getUrl(assembleEndpoint(endpoint, query)), {
    method,
    headers,
    body: createFormData(body)
  });

export const getHeaders = (headers, accessToken) => {
  if (accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      ...headers
    };
  }

  return headers;
};

export const createApiCallPromise = ({
  endpoint,
  query = {},
  method = 'GET',
  headers = {},
  body = undefined,
  wasSuccessful = () => true,
  doNotProcess = false
}, dispatch = undefined) => {
  let call = createRequest(endpoint, query, method, headers, body)
    .catch(err => {
      if (err.message && err.message === 'Failed to fetch') {
        return dispatch(
          addNotification('The API server is unreachable. Please check your Internet connection.', false)
        );
      } else {
        throw err;
      }
    });

  // this processing can be manually skipped
  if (doNotProcess !== true) {
    call = call.then(res => res.json())
      .then(({
        success = true,
        code,
        msg = '',
        payload = {}
      }) => {
        if (!success && dispatch) {
          if (dispatch) {
            dispatch(addNotification(`There was a problem on the server. ${msg}`, false));
          }

          return Promise.reject('The API call was not successful.');
        }

        return Promise.resolve(payload);
      });
  }

  return call;
};

export const isTwoHundredCode = (status) => statusCode.accept(status, '2xx');
export const isServerError = (status) => statusCode.accept(status, '5xx');
export const isUnauthorized = (status) => status === 403;

export const apiCall = ({
  type,
  endpoint,
  method = 'GET',
  query = {},
  headers = {},
  accessToken = undefined,
  body = undefined,
  meta = undefined,
  wasSuccessful = isTwoHundredCode,
  doNotProcess = false
}, dispatch = undefined) => ({
  type,
  payload: {
    promise:
      createApiCallPromise({
        endpoint,
        query,
        method,
        headers: getHeaders(headers, accessToken),
        body,
        wasSuccessful,
        doNotProcess
      }, dispatch),
    data: body
  },
  meta: { endpoint, ...meta }
});

const middleware = ({ dispatch }) => next => action => {
  switch (action.type) {
    case CALL_API:
      if (!action.request) {
        throw new Error('API middleware requires request data in the action');
      }

      action = apiCall(action.request, dispatch);
      break;
  }

  return next(action);
};

export const createApiAction = (request) => ({ type: CALL_API, request });

export default middleware;
