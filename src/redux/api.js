import { accessTokenSelector } from './selectors/user';

export const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';

const createFormData = (body) => {
  if (body) {
    const data = new FormData();
    // @todo make it deep! :-)
    Object.keys(body).map(key =>
      data.append(key, body[key]));
    return data;
  }
};

const createRequest = (endpoint, method, headers, body) =>
  fetch(endpoint, {
    method,
    headers,
    body: createFormData(body)
  })
  .then(res => res.json()); // all API responses must be JSON

export const getExtraHeaders = (state) => {
  const token = accessTokenSelector(state);
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  return {}; // nothing extra
};

export const apiCall = ({ type, method, endpoint, headers = {}, body = undefined }, validation = res => res) =>
  (dispatch, getState) => {
    headers = { headers, ...getExtraHeaders(getState()) };
    return dispatch({
      type,
      payload: {
        promise: createRequest(API_BASE + endpoint, method, headers, body).then(validation),
        data: body
      }
    });
  };
