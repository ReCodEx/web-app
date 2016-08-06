import { actionTypes } from '../modules/auth';
import { CALL_API } from './apiMiddleware';

export const LOCAL_STORAGE_KEY = 'recodex/accessToken';

export const storeToken = (accessToken) => {
  if (accessToken && typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, accessToken);
  }
  if (typeof document !== 'undefined') {
    const now = new Date();
    now.setTime(now.getTime() + 1 * 3600 * 1000); // cookie is valid for the next hour
    document.cookie = `accessToken=${accessToken}; exipres=${now.toUTCString()}; path=/`;
  }
};

export const removeToken = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  }
};

export const getToken = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    const pos = document.cookie.indexOf('accessToken=');
    if (pos >= 0) {
      const token = document.cookie.substr(pos + 'accessToken='.length);
      const semicolon = token.indexOf(';');
      return token.substr(0, semicolon >= 0 ? semicolon : undefined);
    }
  }

  return null;
};

const middleware = state => next => action => {
  // manage access token storage
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      storeToken(action.payload.accessToken);
      break;
    case actionTypes.LOGOUT:
      removeToken();
      break;
    case CALL_API:
      action.request.accessToken = getToken();
      if (!action.request.accessToken) {
        // the access token is redundant
        delete action.request.accessToken;
      }

      break;
  }

  return next(action);
};

export default middleware;
