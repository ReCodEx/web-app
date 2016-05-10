import { createAction, handleActions } from 'redux-actions';
import { apiCall, LOCAL_STORAGE_KEY } from '../api';
import { getJSON } from 'redux-api-middleware';
import decodeJwt from 'jwt-decode';


export const actionTypes = {
  LOGIN_REQUEST: 'auth/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'auth/LOGIN_SUCCESS',
  LOGIN_FAILIURE: 'auth/LOGIN_FAILIURE',
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

const accessToken = localStorage.getItem(LOCAL_STORAGE_KEY);

let decodedToken = null;
try {
  decodedToken = decodeJwt(accessToken);
} catch (e) { /* silen failiure */ }

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

export default handleActions({
  [actionTypes.LOGIN_REQUEST]: (state, action) => ({
    status: statusTypes.LOGGING_IN,
    accessToken: null,
    user: null
  }),
  [actionTypes.LOGIN_SUCCESS]: (state, action) => ({
    status: statusTypes.LOGGED_IN,
    accessToken: action.payload.accessToken,
    user: {
      id: action.payload.id,
      firstName: action.payload.firstName,
      lastName: action.payload.firstName,
      email: action.payload.email
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

export const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return {
    type: actionTypes.LOGOUT
  };
};

export const login = (email, password) => apiCall({
  // method: 'post',
  method: 'get',
  // endpoint: '/login',
  // body: {
  //   email, password
  // }
  endpoint: `/login?email=${email}&password=${password}`,
  types: [
    actionTypes.LOGIN_REQUEST,
    {
      type: actionTypes.LOGIN_SUCCESS,
      payload: (action, state, res) => {
        return getJSON(res).then((json) => {
          // save the access token to the local storage and into cookies (for serverside rendering)
          // const accessToken = json.payload.accessToken;
          const accessToken = json[0].accessToken;
          localStorage.setItem(LOCAL_STORAGE_KEY, accessToken);
          // this should be exclusive to browser, but be careful anyway!
          if (typeof document !== 'undefined') {
            document.cookie = `accessToken=${accessToken}`
          }

          return json[0];
        });
      }
    },
    actionTypes.LOGIN_FAILIURE
  ]
});
