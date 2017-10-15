import { handleActions } from 'redux-actions';
import { actionTypes } from './auth';
import { decode, isTokenValid } from '../helpers/token';
import { addNotification } from './notifications';

export const switchUser = userId => (dispatch, getState) => {
  const state = getState().userSwitching;
  const user = state[userId] ? state[userId] : null;
  const decodedToken = decode(user.accessToken);
  if (!user.accessToken || !isTokenValid(decodedToken)) {
    dispatch(addNotification('The token has already expired.', false));
  } else {
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: user,
      meta: { service: 'takeover' }
    });
  }
};

const initialState = {};

const reducer = handleActions(
  {
    [actionTypes.LOGIN_SUCCESS]: (state, { payload }) =>
      state[payload.user.id]
        ? state
        : {
            ...state,
            [payload.user.id]: payload
          }
  },
  initialState
);

export default reducer;
