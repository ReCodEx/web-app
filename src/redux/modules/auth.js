import { createAction, handleActions } from 'redux-actions';
import decodeJwt from 'jwt-decode';
import { createApiAction } from '../middleware/apiMiddleware';
import { loadUserData } from './users';

import { push } from 'react-router-redux';
import { HOME_URI } from '../../links';

export const actionTypes = {
  LOGIN: 'auth/LOGIN',
  LOGIN_REQUEST: 'auth/LOGIN_PENDING',
  LOGIN_SUCCESS: 'auth/LOGIN_FULFILLED',
  LOGIN_FAILIURE: 'auth/LOGIN_REJECTED',
  LOGOUT: 'auth/LOGOUT'
};

export const statusTypes = {
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_IN: 'LOGGED_IN',
  LOGGING_IN: 'LOGGING_IN',
  LOGIN_FAILED: 'LOGIN_FAILED'
};

const getUserId = (token) => token.sub.id;

/**
 * Actions
 */

export const logout = () =>
  (dispatch, getState) => {
    dispatch(push(HOME_URI));
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

/**
 * Authentication reducer.
 * @param  {string} accessToken An access token to initialise the reducer
 * @return {function} The initialised reducer
 */
const auth = (accessToken) => {
  let decodedToken = null;
  try {
    decodedToken = decodeJwt(accessToken);
  } catch (e) { /* silent failiure */ }

  const initialState = accessToken && decodedToken
    ? {
      status: statusTypes.LOGGED_IN,
      accessToken: accessToken,
      userId: getUserId(decodedToken)
    }
    : {
      status: statusTypes.LOGGED_OUT,
      accessToken: null,
      userId: null
    };

  return handleActions({

    [actionTypes.LOGIN_REQUEST]: (state, action) => ({
      status: statusTypes.LOGGING_IN,
      accessToken: null,
      userId: null
    }),

    [actionTypes.LOGIN_SUCCESS]: (state, action) => ({
      status: statusTypes.LOGGED_IN,
      accessToken: action.payload.accessToken,
      userId: getUserId(decodeJwt(action.payload.accessToken))
    }),

    [actionTypes.LOGIN_FAILIURE]: (state, action) => ({
      status: statusTypes.LOGIN_FAILED,
      accessToken: null,
      userId: null
    }),

    [actionTypes.LOGOUT]: (state, action) => ({
      status: status.LOGGED_OUT,
      accessToken: null,
      userId: null
    })

  }, initialState);
};

export default auth;
