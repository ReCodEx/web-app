import { accessTokenSelector } from './selectors/user';

export const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';

const createFormData = (body) => {
  if (body) {
    const data = new FormData();
    // @todo make it deep! :-)
    Object.keys(body).map(key =>
      data.append(key, body[key]));
    return data;
  }
};

const maybeQuestionMark = endpoint => endpoint.indexOf('?') === -1 ? '?' : '';

const generateQuery = query =>
  query.length === 0
    ? ''
    : Object.keys(query).map(key => `${key}=${query[key]}`).join('&');

const createRequest = (endpoint, query = {}, method, headers, body) =>
  fetch(endpoint + maybeQuestionMark(endpoint) + generateQuery(query), {
    method,
    headers,
    body: createFormData(body)
  })
  .then(res => res.json())
  .then(json => json.payload);

export const getExtraHeaders = (state) => {
  const token = accessTokenSelector(state);
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  return {}; // nothing extra
};

export const apiCall = ({ type, method, endpoint, query = {}, headers = {}, body = undefined, meta = undefined }) =>
  (dispatch, getState) => {
    headers = { headers, ...getExtraHeaders(getState()) };
    return dispatch({
      type,
      payload: {
        promise: createRequest(API_BASE + endpoint, query, method, headers, body),
        data: body
      },
      meta
    });
  };
