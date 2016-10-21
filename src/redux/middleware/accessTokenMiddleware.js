import { actionTypes } from '../modules/auth';
import { actionTypes as registrationActionTypes } from '../modules/registration';
import { CALL_API } from './apiMiddleware';
import cookies from 'browser-cookies';

export const LOCAL_STORAGE_KEY = 'recodex/accessToken';
export const COOKIES_KEY = 'recodex_accessToken';

export const storeToken = (accessToken) => {
  if (accessToken && typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, accessToken);
  }

  if (typeof document !== 'undefined') {
    // @todo: expire after 'exp' in the token
    cookies.set(COOKIES_KEY, accessToken, { expires: 14 }); // expires after 14 days
  }
};

export const removeToken = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    cookies.erase(COOKIES_KEY);
  }
};

export const getToken = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    cookies.get(COOKIES_KEY);
  }

  return null;
};

const middleware = state => next => action => {
  // manage access token storage
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
    case registrationActionTypes.CREATE_ACCOUNT_FULFILLED:
      storeToken(action.payload.accessToken);
      break;
    case actionTypes.LOGOUT:
      removeToken();
      break;
    case CALL_API:
      if (!action.request.accessToken) {
        const token = getToken();
        if (token) {
          action.request.accessToken = token;
        }
      }

      break;
  }

  return next(action);
};

export default middleware;
