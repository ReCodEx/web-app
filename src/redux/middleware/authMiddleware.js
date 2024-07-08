import cookies from 'browser-cookies';

import { actionTypes } from '../modules/authTypes.js';
import { jwtSelector } from '../selectors/auth.js';
import { actionTypes as registrationActionTypes } from '../modules/registration.js';
import { actionTypes as usersActionTypes } from '../modules/users.js';
import { setLang } from '../modules/app.js';
import { CALL_API } from './apiMiddleware.js';
import { safeGet, canUseDOM } from '../../helpers/common.js';
import { getConfigVar } from '../../helpers/config.js';

const PERSISTENT_TOKENS_KEY_PREFIX = getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recodex';

export const TOKEN_LOCAL_STORAGE_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '/accessToken';
export const TOKEN_COOKIES_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '_accessToken';

export const INSTANCEID_LOCAL_STORAGE_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '/instanceId';
export const INSTANCEID_COOKIES_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '_instanceId';

/**
 * Store security token to both local storage and cookies.
 */
export const storeToken = accessToken => {
  if (canUseDOM && accessToken) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, accessToken);
    }

    // @todo: expire after 'exp' in the token
    cookies.set(TOKEN_COOKIES_KEY, accessToken, { expires: 14 }); // expires after 14 days
  }
};

/**
 * Remove security token from both local storage and cookies.
 */
export const removeToken = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    cookies.erase(TOKEN_COOKIES_KEY);
  }
};

/**
 * Fetch security token from local storage and if it fails, try the cookies.
 */
export const getToken = () => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY);
    if (token) {
      storeToken(token); // make sure the token is stored in cookies for page refreshes
      return token;
    }
  }

  if (typeof document !== 'undefined') {
    const token = cookies.get(TOKEN_COOKIES_KEY);
    if (token) {
      storeToken(token); // make sure the token is stored in localStorage as well
      return token;
    }
  }

  return null;
};

/**
 * Store instance ID to both local storage and cookies.
 */
export const storeInstanceId = instanceId => {
  if (canUseDOM && instanceId) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(INSTANCEID_LOCAL_STORAGE_KEY, instanceId);
    }

    cookies.set(INSTANCEID_COOKIES_KEY, instanceId, { expires: 365 });
  }
};

/**
 * Remove instance ID from both local storage and cookies.
 */
export const removeInstanceId = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(INSTANCEID_LOCAL_STORAGE_KEY);
  }

  if (typeof document !== 'undefined') {
    cookies.erase(INSTANCEID_COOKIES_KEY);
  }
};

/**
 * Fetch the selected instance ID from local storage and if it fails, try the cookies.
 */
export const getInstanceId = () => {
  if (typeof localStorage !== 'undefined') {
    const instanceId = localStorage.getItem(INSTANCEID_LOCAL_STORAGE_KEY);
    if (instanceId) {
      storeInstanceId(instanceId); // make sure the instanceId is stored in cookies for page refreshes
      return instanceId;
    }
  }

  if (typeof document !== 'undefined') {
    const instanceId = cookies.get(INSTANCEID_COOKIES_KEY);
    if (instanceId) {
      storeInstanceId(instanceId); // make sure the instanceId is stored in localStorage as well
      return instanceId;
    }
  }

  return null;
};

const middleware = store => next => action => {
  // manage access token storage
  switch (action && action.type) {
    case usersActionTypes.UPDATE_FULFILLED:
      if (!action.payload.accessToken) {
        break;
      }
    /* eslint no-fallthrough: "off" */
    case actionTypes.LOGIN_FULFILLED:
    case registrationActionTypes.CREATE_ACCOUNT_FULFILLED:
      if (safeGet(action, ['meta', 'createdBySuperadmin'], false)) {
        break;
      }
      storeToken(action.payload.accessToken);
      storeInstanceId(safeGet(action, ['meta', 'instanceId'], action.payload.user.privateData.instancesIds[0]));
      if (typeof window !== 'undefined') {
        store.dispatch(setLang(action.payload.user.privateData.settings.defaultLanguage));
      }
      break;

    case actionTypes.LOGIN_REJECTED:
    case actionTypes.LOGOUT:
      removeToken();
      removeInstanceId();
      break;

    case actionTypes.SELECT_INSTANCE:
      storeInstanceId(action.payload.instanceId);
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
