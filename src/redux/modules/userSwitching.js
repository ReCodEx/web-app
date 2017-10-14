import { handleActions } from 'redux-actions';
import { actionTypes } from './auth';
import { isTokenValid } from '../helpers/token';
import { addNotification } from './notifications';

export const switchUser = userId => (dispatch, getState) => {
  const state = getState().userSwitching;
  const accessToken = state[userId] ? state[userId].accessToken : null;
  if (!accessToken || !isTokenValid(accessToken)) {
    dispatch(addNotification('The token has already expired.', false));
  } else {
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: { accessToken },
      meta: { service: 'takeover' }
    });
  }
};

const initialState = {};

const reducer = handleActions(
  {
    [actionTypes.LOGIN_SUCCESS]: (state, { payload: { user, accessToken } }) =>
      state[user.id]
        ? state
        : {
            ...state,
            [user.id]: {
              user: {
                id: user.id,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl
              },
              accessToken
            }
          }
  },
  initialState
);

export default reducer;
