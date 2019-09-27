import { handleActions, createAction } from 'redux-actions';
import { actionTypes as authActionTypes } from './authTypes';
import { decode, isTokenValid } from '../helpers/token';
import { addNotification } from './notifications';
import { createApiAction } from '../middleware/apiMiddleware';
import { safeGet } from '../../helpers/common';

export const actionTypes = {
  REMOVE_USER: 'recodex/userSwitching/REMOVE_USER',
  REFRESH_TOKEN: 'recodex/userSwitching/REFRESH_TOKEN',
  REFRESH_TOKEN_PENDING: 'recodex/userSwitching/REFRESH_TOKEN_PENDING',
  REFRESH_TOKEN_FULFILLED: 'recodex/userSwitching/REFRESH_TOKEN_FULFILLED',
  REFRESH_TOKEN_REJECTED: 'recodex/userSwitching/REFRESH_TOKEN_REJECTED',
};

export const removeUser = createAction(actionTypes.REMOVE_USER);

export const switchUser = userId => (dispatch, getState) => {
  const state = getState().userSwitching;
  const { user, accessToken } = state[userId] || null;
  const decodedToken = decode(accessToken);
  if (!accessToken || !isTokenValid(decodedToken)) {
    dispatch(
      addNotification(
        `The token has already expired, you cannot switch to user ${user.fullName}. This account will be removed from the user switching panel.`,
        false
      )
    );
    dispatch(removeUser(userId));
  } else {
    dispatch({
      type: authActionTypes.LOGIN_FULFILLED,
      payload: { user, accessToken },
      meta: { service: 'takeover' },
    });

    if (window && window.location && window.location.reload) {
      window.location.reload(true);
    }
  }
};

export const refreshUserToken = (userId, accessToken) =>
  createApiAction({
    type: actionTypes.REFRESH_TOKEN,
    method: 'POST',
    endpoint: '/login/refresh',
    meta: { userId },
    accessToken,
  });

const initialState = {};

const updateUserState = (state, payload) =>
  safeGet(payload, ['user', 'privateData', 'isAllowed'])
    ? {
        ...state,
        [payload.user.id]: payload,
      }
    : removeUserFromState(state, payload.user.id);

const removeUserFromState = (state, userId) =>
  Object.keys(state)
    .filter(id => id !== userId)
    .reduce((acc, id) => ({ ...acc, [id]: state[id] }), {});

const reducer = handleActions(
  {
    [actionTypes.REFRESH_TOKEN_PENDING]: (state, { meta: { userId } }) => {
      if (state[userId]) {
        const newState = { ...state };
        newState[userId].refreshing = true;
        return newState;
      } else {
        return state;
      }
    },

    [authActionTypes.LOGIN_FULFILLED]: (state, { payload }) => updateUserState(state, payload),
    [actionTypes.REFRESH_TOKEN_FULFILLED]: (state, { payload }) => updateUserState(state, payload),

    [actionTypes.REMOVE_USER]: (state, { payload: userId }) => removeUserFromState(state, userId),
    [actionTypes.REFRESH_TOKEN_REJECTED]: (state, { meta: { userId } }) => removeUserFromState(state, userId),
  },
  initialState
);

export default reducer;
