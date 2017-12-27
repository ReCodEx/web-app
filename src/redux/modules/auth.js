import { handleActions } from 'redux-actions';
import { push } from 'react-router-redux';
import { fromJS } from 'immutable';
import { decode, isTokenValid } from '../helpers/token';
import { createApiAction } from '../middleware/apiMiddleware';
import { actionTypes as registrationActionTypes } from './registration';

export const actionTypes = {
  LOGIN: 'recodex/auth/LOGIN',
  LOGIN_REQUEST: 'recodex/auth/LOGIN_PENDING',
  LOGIN_SUCCESS: 'recodex/auth/LOGIN_FULFILLED',
  LOGIN_FAILIURE: 'recodex/auth/LOGIN_REJECTED',
  RESET_PASSWORD: 'recodex/auth/RESET_PASSWORD',
  RESET_PASSWORD_PENDING: 'recodex/auth/RESET_PASSWORD_PENDING',
  RESET_PASSWORD_FULFILLED: 'recodex/auth/RESET_PASSWORD_FULFILLED',
  RESET_PASSWORD_REJECTED: 'recodex/auth/RESET_PASSWORD_REJECTED',
  CHANGE_PASSWORD: 'recodex/auth/CHANGE_PASSWORD',
  CHANGE_PASSWORD_PENDING: 'recodex/auth/CHANGE_PASSWORD_PENDING',
  CHANGE_PASSWORD_FULFILLED: 'recodex/auth/CHANGE_PASSWORD_FULFILLED',
  CHANGE_PASSWORD_REJECTED: 'recodex/auth/CHANGE_PASSWORD_REJECTED',
  LOGOUT: 'recodex/auth/LOGOUT'
};

export const statusTypes = {
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_IN: 'LOGGED_IN',
  LOGGING_IN: 'LOGGING_IN',
  LOGIN_FAILED: 'LOGIN_FAILED'
};

const getUserId = token => token.get('sub');

/**
 * Actions
 */

export const logout = redirectUrl => dispatch => {
  if (redirectUrl) {
    dispatch(push(redirectUrl));
  }
  dispatch({
    type: actionTypes.LOGOUT
  });
};

export const LOCAL_LOGIN = 'recodex-local-login';

export const takeOver = userId =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: `/login/takeover/${userId}`,
    meta: { service: LOCAL_LOGIN }
  });

export const login = (username, password) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login',
    body: { username, password },
    meta: { service: LOCAL_LOGIN }
  });

export const resetPassword = username =>
  createApiAction({
    type: actionTypes.RESET_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password',
    body: { username }
  });

export const changePassword = (password, accessToken) =>
  createApiAction({
    type: actionTypes.CHANGE_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password/change',
    accessToken,
    body: { password }
  });

export const validatePasswordStrength = password =>
  createApiAction({
    type: 'VALIDATE_PASSWORD_STRENGTH',
    endpoint: '/forgotten-password/validate-password-strength',
    method: 'POST',
    body: { password }
  });

export const externalLogin = service => (credentials, popupWindow = null) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: `/login/${service}`,
    body: credentials,
    meta: { service, popupWindow }
  });

export const externalLoginFailed = service => ({
  type: actionTypes.LOGIN_FAILIURE,
  meta: { service }
});

export const loginServices = {
  local: LOCAL_LOGIN,
  external: {
    CAS_UK: 'cas-uk',
    CAS_UK_TICKET: 'cas-uk/oauth'
  }
};

export const refresh = () =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login/refresh'
  });

export const decodeAndValidateAccessToken = (token, now = Date.now()) => {
  let decodedToken = null;
  if (token) {
    try {
      decodedToken = decode(token);
      if (isTokenValid(decodedToken, now) === false) {
        decodedToken = null;
      }
    } catch (e) {
      // silent error
    }
  }

  return fromJS(decodedToken);
};

/**
 * Authentication reducer.
 * @param  {string} accessToken An access token to initialise the reducer
 * @return {function} The initialised reducer
 */
const auth = (accessToken, now = Date.now()) => {
  const decodedToken = decodeAndValidateAccessToken(accessToken, now);
  const initialState =
    accessToken && decodedToken
      ? fromJS({
          status: {},
          jwt: accessToken,
          accessToken: decodedToken,
          userId: getUserId(decodedToken)
        })
      : fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null
        });

  return handleActions(
    {
      [actionTypes.LOGIN_REQUEST]: (state, { meta: { service } }) =>
        state.setIn(['status', service], statusTypes.LOGGING_IN),

      [actionTypes.LOGIN_SUCCESS]: (
        state,
        { payload: { accessToken }, meta: { service, popupWindow } }
      ) => {
        if (
          popupWindow &&
          !popupWindow.closed &&
          popupWindow.close &&
          popupWindow.postMessage
        ) {
          // Double kill (in case we cannot close the window, it may listen to a message and drop dead on its own)
          popupWindow.postMessage('die', window.location.origin);
          popupWindow.close();
        }
        return state
          .setIn(['status', service], statusTypes.LOGGED_IN)
          .set('jwt', accessToken)
          .set('accessToken', decodeAndValidateAccessToken(accessToken))
          .set('userId', getUserId(decodeAndValidateAccessToken(accessToken)));
      },

      [actionTypes.LOGIN_FAILIURE]: (
        state,
        { meta: { service, popupWindow } }
      ) => {
        if (
          popupWindow &&
          !popupWindow.closed &&
          popupWindow.close &&
          popupWindow.postMessage
        ) {
          // Double kill (in case we cannot close the window, it may listen to a message and drop dead on its own)
          popupWindow.postMessage('die', window.location.origin);
          popupWindow.close();
        }
        return state
          .setIn(['status', service], statusTypes.LOGIN_FAILED)
          .set('jwt', null)
          .set('accessToken', null)
          .set('userId', null);
      },

      [registrationActionTypes.CREATE_ACCOUNT_FULFILLED]: (
        state,
        { payload: { accessToken }, meta: { service } }
      ) =>
        state
          .setIn(['status', service], statusTypes.LOGGED_IN)
          .set('jwt', accessToken)
          .set('accessToken', decodeAndValidateAccessToken(accessToken))
          .set('userId', getUserId(decodeAndValidateAccessToken(accessToken))),

      [actionTypes.LOGOUT]: (state, action) =>
        state
          .update('status', services =>
            services.map(() => statusTypes.LOGGED_OUT)
          )
          .set('jwt', null)
          .set('accessToken', null)
          .set('userId', null),

      [actionTypes.CHANGE_PASSWORD_PENDING]: (state, action) =>
        state.set('changePasswordStatus', 'PENDING'),

      [actionTypes.CHANGE_PASSWORD_FAILED]: (state, action) =>
        state.set('changePasswordStatus', 'FAILED'),

      [actionTypes.CHANGE_PASSWORD_FULFILLED]: (state, action) =>
        state.set('changePasswordStatus', 'FULFILLED'),

      [actionTypes.RESET_PASSWORD_PENDING]: (state, action) =>
        state.set('resetPasswordStatus', 'PENDING'),

      [actionTypes.RESET_PASSWORD_FAILED]: (state, action) =>
        state.set('resetPasswordStatus', 'FAILED'),

      [actionTypes.RESET_PASSWORD_FULFILLED]: (state, action) =>
        state.set('resetPasswordStatus', 'FULFILLED')
    },
    initialState
  );
};

export default auth;
