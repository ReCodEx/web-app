import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

export const actionTypes = {
  ADD_NOTIFICATION: 'recovid/notifications/ADD_NOTIFICATION',
  HIDE_NOTIFICATION: 'recovid/notifications/HIDE_NOTIFICATION',
  HIDE_ALL: 'recovid/notifications/HIDE_ALL',
};

export const initialState = fromJS({
  visible: [],
  hidden: [],
});

export const addNotification = createAction(
  actionTypes.ADD_NOTIFICATION,
  (msg, successful = true, id = null, time = null) => {
    if (id === null) {
      id = Math.random();
    }

    if (!time) {
      time = Date.now();
    }
    return { id, msg, successful, time };
  }
);

export const hideNotification = createAction(actionTypes.HIDE_NOTIFICATION, id => ({ id }));
export const hideAll = createAction(actionTypes.HIDE_ALL);

const reducer = handleActions(
  {
    [actionTypes.ADD_NOTIFICATION]: (state, { payload }) => {
      const index = state.get('visible').findIndex(visible => visible.msg === payload.msg);
      if (index < 0) {
        return state.update('visible', visible => visible.push({ ...payload, count: 1 }));
      } else {
        return state.updateIn(['visible', index], oldMsg => ({
          ...oldMsg,
          count: oldMsg.count + 1,
        }));
      }
    },

    [actionTypes.HIDE_NOTIFICATION]: (state, { payload: { id } }) =>
      state
        .update('hidden', hidden => hidden.push(state.get('visible').find(notification => notification.id === id)))
        .update('visible', visible => visible.filter(notification => notification.id !== id)),

    [actionTypes.HIDE_ALL]: state =>
      state.update('hidden', hidden => hidden.concat(state.get('visible'))).set('visible', List()),
  },
  initialState
);

export default reducer;
