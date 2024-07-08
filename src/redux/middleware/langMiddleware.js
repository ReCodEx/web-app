import cookies from 'browser-cookies';

import { actionTypes } from '../modules/app.js';
import { getConfigVar } from '../../helpers/config.js';
import { canUseDOM } from '../../helpers/common.js';

const PERSISTENT_TOKENS_KEY_PREFIX = getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recodex';

export const LANG_LOCAL_STORAGE_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '/lang';
export const LANG_COOKIES_KEY = PERSISTENT_TOKENS_KEY_PREFIX + '_lang';

/**
 * Store selected lang to both local storage and cookies.
 */
export const storeLang = instanceId => {
  if (canUseDOM && instanceId) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_LOCAL_STORAGE_KEY, instanceId);
    }

    cookies.set(LANG_COOKIES_KEY, instanceId, { expires: 365 });
  }
};

/**
 * Fetch selected lang from local storage and if it fails, try the cookies.
 */
export const getLang = () => {
  if (typeof localStorage !== 'undefined') {
    const instanceId = localStorage.getItem(LANG_LOCAL_STORAGE_KEY);
    if (instanceId) {
      storeLang(instanceId); // make sure the instanceId is stored in cookies for page refreshes
      return instanceId;
    }
  }

  if (typeof document !== 'undefined') {
    const instanceId = cookies.get(LANG_COOKIES_KEY);
    if (instanceId) {
      storeLang(instanceId); // make sure the instanceId is stored in localStorage as well
      return instanceId;
    }
  }

  return 'en';
};

const middleware = store => next => action => {
  // manage lang storage
  if (action && action.type === actionTypes.SET_LANG) {
    storeLang(action.payload.lang);
  }
  return next(action);
};

export default middleware;
