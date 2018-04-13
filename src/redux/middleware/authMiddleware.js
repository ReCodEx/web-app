import { actionTypes } from '../modules/auth';
import { jwtSelector } from '../selectors/auth';
import { actionTypes as registrationActionTypes } from '../modules/registration';
import { actionTypes as usersActionTypes } from '../modules/users';

import { CALL_API } from './apiMiddleware';
import cookies from 'browser-cookies';
import { canUseDOM } from 'exenv';
import { changeLanguage } from '../../links';
import { push } from 'react-router-redux';

export const LOCAL_STORAGE_KEY = 'recodex/accessToken';
export const COOKIES_KEY = 'recodex_accessToken';

export const storeToken = accessToken => {
  if (canUseDOM && accessToken) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, accessToken);
    }

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
    const token = localStorage.getItem(LOCAL_STORAGE_KEY);
    storeToken(token); // make sure the token is stored in cookies for page refreshes
    return token;
  }

  if (typeof document !== 'undefined') {
    cookies.get(COOKIES_KEY);
  }

  return null;
};

const middleware = store => next => action => {
  // manage access token storage
  switch (action.type) {
    case usersActionTypes.UPDATE_FULFILLED:
      if (!action.payload.accessToken) {
        break;
      }
    /* eslint no-fallthrough: "allow" */
    case actionTypes.LOGIN_SUCCESS:
    case registrationActionTypes.CREATE_ACCOUNT_FULFILLED:
      storeToken(action.payload.accessToken);
      if (typeof window !== 'undefined') {
        store.dispatch(
          push(
            changeLanguage(
              window.location.pathname,
              action.payload.user.privateData.settings.defaultLanguage
            )
          )
        );
      }
      break;
    case actionTypes.LOGOUT:
      removeToken();
      break;
    case CALL_API:
      if (!action.request.accessToken) {
        const token = jwtSelector(store.getState());
        if (token) {
          // do not override the token if it was set explicitly and there is none in the state
          action.request.accessToken = token;
        }
      }

      break;
  }

  return next(action);
};

export default middleware;
