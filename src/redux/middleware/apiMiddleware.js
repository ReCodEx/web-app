import statusCode from 'statuscode';
import { addNotification } from '../modules/notifications';

export const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';
export const CALL_API = 'recodex-api/CALL';

const maybeShash = endpoint =>
  endpoint.indexOf('/') === 0 ? '' : '/';

const getUrl = endpoint =>
  API_BASE + maybeShash(endpoint) + endpoint;

const createFormData = (body) => {
  if (body) {
    const data = new FormData();
    Object.keys(body).map(key => {
      if (Array.isArray(body[key])) {
        body[key].map(item =>
          data.append(`${key}[]`, item));
      } else {
        data.append(key, body[key]);
      }
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
      ...headers,
      'Authorization': `Bearer ${accessToken}`
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
  wasSuccessful = () => true
}, dispatch = undefined) =>
  createRequest(endpoint, query, method, headers, body)
    .catch(err => {
      if (err.message && err.message === 'Failed to fetch') {
        dispatch(
          addNotification('The API server is unreachable. Please check your Internet connection.', false)
        );
      } else {
        throw err;
      }
    })
    .then(res => res.json())
    .then(({
      success = true,
      code,
      msg = '',
      payload = {}
     }) => {
      if (!success && dispatch) {
        if (isServerError(code)) {
          dispatch(addNotification(`There was a problem on the server. ${msg}`, false));
        } else {
          dispatch(addNotification(msg, false));
        }
      }

      if (!success) {
        return Promise.reject('The API call was not successful.');
      }

      return Promise.resolve(payload);
    });

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
  wasSuccessful = isTwoHundredCode
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
        wasSuccessful
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

export const createApiAction = request => ({ type: CALL_API, request });

export default middleware;
