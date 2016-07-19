import { createAction, handleActions } from 'redux-actions';
import decodeJwt from 'jwt-decode';
import { apiCall } from '../api';

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

const getAccessTokenPayload = (token) => ({
  id: token.sub,
  firstName: token.firstName,
  lastName: token.lastName,
  email: token.email
});

/**
 * Authentication reducer.
 * @param  {string} accessToken An access token to initialise the reducer
 * @return {function} The initialised reducer
 */
const auth = (accessToken) => {
  try {
    decodedToken = decodeJwt(accessToken);
  } catch (e) { /* silent failiure */ }

  const initialState = accessToken && decodedToken
    ? {
      status: statusTypes.LOGGED_IN,
      accessToken: accessToken,
      user: getAccessTokenPayload(decodedToken)
    }
    : {
      status: statusTypes.LOGGED_OUT,
      accessToken: null,
      user: null
    };

  return handleActions({
    [actionTypes.LOGIN_REQUEST]: (state, action) => ({
      status: statusTypes.LOGGING_IN,
      accessToken: null,
      user: null
    }),
    [actionTypes.LOGIN_SUCCESS]: (state, action) => ({
      status: statusTypes.LOGGED_IN,
      accessToken: action.payload[0].accessToken,
      user: {
        id: action.payload[0].id,
        firstName: action.payload[0].firstName,
        lastName: action.payload[0].lastName,
        email: action.payload[0].email
      }
    }),
    [actionTypes.LOGIN_FAILED]: (state, action) => ({
      status: status.LOGIN_FAILED,
      accessToken: null,
      user: null
    }),
    [actionTypes.LOGOUT]: (state, action) => ({
      status: status.LOGGED_OUT,
      accessToken: null,
      user: null
    })
  }, initialState);
};

export default auth;

export const logout = () => ({
  type: actionTypes.LOGOUT
});

export const login = (email, password) =>
  apiCall({
    type: actionTypes.LOGIN,
    // method: 'post',
    // endpoint: '/login',
    // body: {
    //   email, password
    // }
    method: 'get',
    endpoint: `/login?email=${email}&password=${password}`,
  });
