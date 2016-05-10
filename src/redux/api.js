import { CALL_API } from 'redux-api-middleware';

export const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';
export const LOCAL_STORAGE_KEY = 'recodex/accessToken';

export const apiCall = ({ method, endpoint, types, headers = {}, body = undefined }) => ({
  [CALL_API]: {
    endpoint: API_BASE + endpoint,
    method,
    headers,
    body,
    types
  }
});

export const authenticatedApiCall = ({ method, endpoint, types, headers = {}, body = {} }) => {
  const accessToken = localStorage(ACCESS_TOKEN_KEY);
  return apiCall(method, endpoint, { ...headers, 'Authorization': `Bearer ${accessToken}` }, body);
};
