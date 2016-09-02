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
  LOGOUT: 'recodex/auth/LOGOUT'
};

export const statusTypes = {
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_IN: 'LOGGED_IN',
  LOGGING_IN: 'LOGGING_IN',
  LOGIN_FAILED: 'LOGIN_FAILED'
};

const getUserId = (token) => token.getIn(['sub', 'id']);

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
    method: 'GET',
    endpoint: '/login',
    query: { username, password }
  });

export const refresh = () =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'GET',
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
            .set('userId', null)

  }, initialState);
};

export default auth;
