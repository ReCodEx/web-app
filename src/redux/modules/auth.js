import { createAction, handleActions } from 'redux-actions';
import { push } from 'react-router-redux';
import { fromJS } from 'immutable';
import decodeJwt from 'jwt-decode';
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

const getUserId = (token) => token.get('sub');

/**
 * Actions
 */

export const logout = redirectUrl =>
  dispatch => {
    dispatch(push(redirectUrl));
    dispatch({
      type: actionTypes.LOGOUT
    });
  };

export const login = (username, password) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login',
    body: { username, password }
  });

export const resetPassword = (username) =>
  createApiAction({
    type: actionTypes.RESET_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password',
    body: { username }
  });

export const changePassword = (password, accessToken) =>
  createApiAction({
    type: actionTypes.RESET_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password/change',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: { password }
  });

export const validatePasswordStrength = (password) =>
  createApiAction({
    type: 'VALIDATE_PASSWORD_STRENGTH',
    endpoint: '/forgotten-password/validate-password-strength',
    method: 'POST',
    body: { password }
  });

export const externalLogin = serviceId => (username, password) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: `/login/${serviceId}`,
    body: { username, password }
  });

export const loginCAS = externalLogin('cas-uk');

export const refresh = () =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login/refresh'
  });

export const isTokenValid = token =>
  token && token.get('exp') * 1000 > Date.now();

export const willExpireSoon = token =>
  token && token.get('exp') - (Date.now() / 1000) < (token.get('exp') - token.get('iat')) / 3; // last third of the validity period

export const decodeAccessToken = token => {
  let decodedToken = null;
  if (token) {
    try {
      decodedToken = fromJS(decodeJwt(token));
      if (isTokenValid(decodedToken) === false) {
        decodedToken = null;
      }
    } catch (e) {
      // silent error
    }
  }

  return decodedToken;
};

/**
 * Authentication reducer.
 * @param  {string} accessToken An access token to initialise the reducer
 * @return {function} The initialised reducer
 */
const auth = (accessToken) => {
  const decodedToken = decodeAccessToken(accessToken);
  const initialState = accessToken && decodedToken
    ? fromJS({
      status: statusTypes.LOGGED_IN,
      accessToken: decodedToken,
      userId: getUserId(decodedToken)
    })
    : fromJS({
      status: statusTypes.LOGGED_OUT,
      accessToken: null,
      userId: null
    });

  return handleActions({

    [actionTypes.LOGIN_REQUEST]: (state, action) =>
      state.set('status', statusTypes.LOGGING_IN),

    [actionTypes.LOGIN_SUCCESS]: (state, action) =>
      state.set('status', statusTypes.LOGGED_IN)
            .set('accessToken', decodeAccessToken(action.payload.accessToken))
            .set('userId', getUserId(decodeAccessToken(action.payload.accessToken))),

    [registrationActionTypes.CREATE_ACCOUNT_FULFILLED]: (state, action) =>
      state.set('status', statusTypes.LOGGED_IN)
            .set('accessToken', decodeAccessToken(action.payload.accessToken))
            .set('userId', getUserId(decodeAccessToken(action.payload.accessToken))),

    [actionTypes.LOGIN_FAILIURE]: (state, action) =>
      state.set('status', statusTypes.LOGIN_FAILED)
            .set('accessToken', null)
            .set('userId', null),

    [actionTypes.LOGOUT]: (state, action) =>
      state.set('status', statusTypes.LOGGED_OUT)
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

  }, initialState);
};

export default auth;
