import statusCode from 'statuscode';

export const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';
export const CALL_API = 'recodex-api/CALL';

const maybeShash = endpoint =>
  endpoint.indexOf('/') === 0 ? '' : '/';

const getUrl = endpoint =>
  API_BASE + maybeShash(endpoint) + endpoint;

const createFormData = (body) => {
  if (body) {
    const data = new FormData();
    Object.keys(body).map(key =>
      data.append(key, body[key]));
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

export const createPromise = (endpoint, query, method, headers, body, wasSuccessful) =>
  createRequest(endpoint, query, method, headers, body)
    .then(res => {
      if (!wasSuccessful(res)) {
        throw new Error('The API call was not successful.', wasSuccessful);
      }

      return res;
    })
    .then(res => res.json())
    .then(json => json.payload);

export const isTwoHundredCode = (res) => statusCode.accept(res.status, '2xx');

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
}) => ({
  type,
  payload: {
    promise:
      createPromise(
        endpoint,
        query,
        method,
        getHeaders(headers, accessToken),
        body,
        wasSuccessful
      ),
    data: body
  },
  meta
});

const middleware = state => next => action => {
  switch (action.type) {
    case CALL_API:
      if (!action.request) {
        throw new Error('API middleware requires request data in the action');
      }

      action = apiCall(action.request);
      break;
  }

  return next(action);
};

export const createApiAction = request => ({ type: CALL_API, request });

export default middleware;
