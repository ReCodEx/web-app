import { actionTypes } from '../modules/auth';

export const LOCAL_STORAGE_KEY = 'recodex/accessToken';

const storeToken = (payload) => {
  // const accessToken = payload.accessToken;
  const accessToken = payload[0].accessToken; // @todo change with the final API
  if (accessToken) {
    localStorage.setItem(LOCAL_STORAGE_KEY, accessToken);
    // this should be exclusive to browser, but be careful anyway!
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${accessToken}`
    }
  }
};

const removeToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  }
};

export const getToken = () =>
  localStorage.getItem(LOCAL_STORAGE_KEY);

const middleware = state => next => action => {
  // manage access token storage
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      storeToken(actionTypes.payload);
    case actionTypes.LOGOUT:
      removeToken();
  }

  return next(action);
};

