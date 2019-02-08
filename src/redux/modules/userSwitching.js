import { handleActions, createAction } from 'redux-actions';
import { actionTypes as authActionTypes } from './auth';
import { decode, isTokenValid } from '../helpers/token';
import { addNotification } from './notifications';

export const actionTypes = {
  REMOVE_USER: 'recodex/userSwitching/REMOVE_USER',
};

export const removeUser = createAction(actionTypes.REMOVE_USER);

export const switchUser = userId => (dispatch, getState) => {
  const state = getState().userSwitching;
  const { user, accessToken } = state[userId] ? state[userId] : null;
  const decodedToken = decode(accessToken);
  if (!accessToken || !isTokenValid(decodedToken)) {
    dispatch(
      addNotification(
        `The token has already expired, you cannot switch to user ${
          user.fullName
        }. This account will be removed from the user switching panel.`,
        false
      )
    );
    dispatch(removeUser(userId));
  } else {
    dispatch({
      type: authActionTypes.LOGIN_SUCCESS,
      payload: { user, accessToken },
      meta: { service: 'takeover' },
    });

    if (window && window.location && window.location.reload) {
      window.location.reload(true);
    }
  }
};

const initialState = {};

const reducer = handleActions(
  {
    [authActionTypes.LOGIN_SUCCESS]: (state, { payload }) =>
      state[payload.user.id]
        ? state
        : {
            ...state,
            [payload.user.id]: payload,
          },
    [actionTypes.REMOVE_USER]: (state, { payload: userId }) =>
      Object.keys(state)
        .filter(id => id !== userId)
        .reduce((acc, id) => ({ ...acc, [id]: state[id] }), {}),
  },
  initialState
);

export default reducer;
