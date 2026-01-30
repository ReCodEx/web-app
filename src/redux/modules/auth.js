import { handleActions, createAction } from 'redux-actions';
import { fromJS } from 'immutable';
import { decode, isTokenValid } from '../helpers/token';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { logout } from '../helpers/api/tools.js';
import { actionTypes as registrationActionTypes } from './registration.js';
import { actionTypes as usersActionTypes } from './users.js';
import { safeGet } from '../../helpers/common.js';

import { actionTypes, statusTypes } from './authTypes.js';
export { actionTypes, statusTypes };

const getUserId = token => token.get('sub');

/**
 * Actions
 */

export const LOCAL_LOGIN = 'recodex-local-login';

export const takeOver = userId =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: `/login/takeover/${userId}`,
    meta: { service: LOCAL_LOGIN },
  });

export const login = (username, password, expiration = null) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login',
    body: { username, password, expiration },
    meta: { service: LOCAL_LOGIN },
  });

export { logout }; // this logically belongs here, but since logout is required internally, we needed to declare it inside api tools

export const resetPassword = username =>
  createApiAction({
    type: actionTypes.RESET_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password',
    body: { username },
  });

export const changePassword = (password, accessToken) =>
  createApiAction({
    type: actionTypes.CHANGE_PASSWORD,
    method: 'POST',
    endpoint: '/forgotten-password/change',
    accessToken,
    body: { password },
  });

export const validatePasswordStrength = password =>
  createApiAction({
    type: 'VALIDATE_PASSWORD_STRENGTH',
    endpoint: '/forgotten-password/validate-password-strength',
    method: 'POST',
    body: { password },
  });

export const externalLogin = (service, token, popupWindow = null) =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: `/login/${service}`,
    body: { token },
    meta: { service, popupWindow },
  });

export const externalLoginFailed = service => ({
  type: actionTypes.LOGIN_REJECTED,
  meta: { service },
});

export const refresh = () =>
  createApiAction({
    type: actionTypes.LOGIN,
    method: 'POST',
    endpoint: '/login/refresh',
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

export const generateToken = (expiration, scopes) =>
  createApiAction({
    type: actionTypes.GENERATE_TOKEN,
    method: 'POST',
    endpoint: '/login/issue-restricted-token',
    body: { expiration: Number(expiration), scopes },
  });

export const restrictEffectiveRole = effectiveRole => (dispatch, getState) => {
  const token = getState().auth.get('accessToken');
  const scopes = token.get('scopes').toArray();
  const expiration = token.get('exp') - token.get('iat');
  return dispatch(
    createApiAction({
      type: actionTypes.LOGIN,
      method: 'POST',
      endpoint: '/login/issue-restricted-token',
      body: { scopes, expiration, effectiveRole },
    })
  );
};

const closeAuthPopupWindow = popupWindow => {
  if (popupWindow && !popupWindow.closed && popupWindow.close && popupWindow.postMessage) {
    // Double kill (in case we cannot close the window, it may listen to a message and drop dead on its own)
    try {
      popupWindow.postMessage('die', window.location.origin);
      popupWindow.close();
    } catch (e) {
      // silent fail, this is probably because one of the kills succeeded and the other one failed
    }
  }
};

export const selectInstance = createAction(actionTypes.SELECT_INSTANCE, instanceId => ({
  instanceId,
}));

/**
 * Authentication reducer.
 * @param  {string} accessToken An access token to initialise the reducer
 * @return {function} The initialised reducer
 */
const auth = (accessToken, instanceId, now = Date.now()) => {
  const decodedToken = decodeAndValidateAccessToken(accessToken, now);
  const initialState =
    accessToken && decodedToken
      ? fromJS({
          status: {},
          jwt: accessToken,
          accessToken: decodedToken,
          userId: getUserId(decodedToken),
          instanceId,
        })
      : fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null,
          instanceId: null,
        });

  return handleActions(
    {
      [actionTypes.LOGIN_PENDING]: (state, { meta: { service } }) =>
        state.setIn(['status', service], statusTypes.LOGGING_IN).deleteIn(['errors', service]),

      [actionTypes.LOGIN_FULFILLED]: (state, { payload: { accessToken, user }, meta: { service, popupWindow } }) => {
        closeAuthPopupWindow(popupWindow);
        return state.getIn(['status', service]) === statusTypes.LOGGING_IN // this should prevent re-login, when explicit logout ocurred whilst refreshing token
          ? state
              .setIn(['status', service], statusTypes.LOGGED_IN)
              .deleteIn(['errors', service])
              .set('jwt', accessToken)
              .set('accessToken', decodeAndValidateAccessToken(accessToken))
              .set('userId', getUserId(decodeAndValidateAccessToken(accessToken)))
              .set('instanceId', safeGet(user, ['privateData', 'instancesIds', 0], null))
          : state;
      },

      [actionTypes.LOGIN_REJECTED]: (state, { meta: { service, popupWindow }, payload }) => {
        closeAuthPopupWindow(popupWindow);
        return state
          .setIn(['status', service], statusTypes.LOGIN_FAILED)
          .setIn(['errors', service], fromJS(payload))
          .set('jwt', null)
          .set('accessToken', null)
          .set('userId', null)
          .set('instanceId', null);
      },

      [registrationActionTypes.CREATE_ACCOUNT_FULFILLED]: (
        state,
        { payload: { accessToken }, meta: { instanceId = null, service = LOCAL_LOGIN, createdBySuperadmin = false } }
      ) =>
        createdBySuperadmin
          ? state
          : state
              .setIn(['status', service], statusTypes.LOGGED_IN)
              .deleteIn(['errors', service])
              .set('jwt', accessToken)
              .set('accessToken', decodeAndValidateAccessToken(accessToken))
              .set('userId', getUserId(decodeAndValidateAccessToken(accessToken)))
              .set('instanceId', instanceId),

      [actionTypes.LOGOUT]: state =>
        state
          .update('status', services => services.map(() => statusTypes.LOGGED_OUT))
          .delete('errors')
          .set('jwt', null)
          .set('accessToken', null)
          .set('userId', null)
          .set('instanceId', null),

      [actionTypes.CHANGE_PASSWORD_PENDING]: state => state.set('changePasswordStatus', 'PENDING'),

      [actionTypes.CHANGE_PASSWORD_FAILED]: state => state.set('changePasswordStatus', 'FAILED'),

      [actionTypes.CHANGE_PASSWORD_FULFILLED]: state => state.set('changePasswordStatus', 'FULFILLED'),

      [actionTypes.RESET_PASSWORD_PENDING]: state => state.set('resetPasswordStatus', 'PENDING'),

      [actionTypes.RESET_PASSWORD_FAILED]: state => state.set('resetPasswordStatus', 'FAILED'),

      [actionTypes.RESET_PASSWORD_FULFILLED]: state => state.set('resetPasswordStatus', 'FULFILLED'),

      [usersActionTypes.UPDATE_FULFILLED]: (state, { payload: { accessToken = null } }) =>
        accessToken
          ? state
              .set('jwt', accessToken)
              .set('accessToken', decodeAndValidateAccessToken(accessToken))
              .set('userId', getUserId(decodeAndValidateAccessToken(accessToken)))
          : state,

      [actionTypes.GENERATE_TOKEN_FULFILLED]: (state, { payload: { accessToken } }) =>
        state.set('lastGeneratedToken', accessToken),

      [actionTypes.SELECT_INSTANCE]: (state, { payload: { instanceId } }) => state.set('instanceId', instanceId),
    },
    initialState
  );
};

export default auth;
