import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

export const actionTypes = {
  ADD_NOTIFICATION: 'recodex/notifications/ADD_NOTIFICATION',
  HIDE_NOTIFICATION: 'recodex/notifications/HIDE_NOTIFICATION',
  HIDE_ALL: 'recodex/notifications/HIDE_ALL'
};

export const initialState = fromJS({
  visible: [],
  hidden: []
});

export const addNotification = createAction(
  actionTypes.ADD_NOTIFICATION,
  (id, msg, successful = true, time = null) => {
    if (!time) {
      time = Date.now();
    }
    return { id, msg, successful, time };
  }
);

export const hideNotification = createAction(actionTypes.HIDE_NOTIFICATION, id => ({ id }));
export const hideAll = createAction(actionTypes.HIDE_ALL);

const reducer = handleActions({

  [actionTypes.ADD_NOTIFICATION]: (state, { payload }) => {
    return state.update('visible', visible => visible.push(payload));
  },

  [actionTypes.HIDE_NOTIFICATION]: (state, { payload: { id } }) =>
    state
      .update('hidden', hidden => hidden.push(state.get('visible').find(notification => notification.id === id)))
      .update('visible', visible => visible.filter(notification => notification.id !== id)),

  [actionTypes.HIDE_ALL]: state =>
    state
      .update('hidden', hidden => hidden.concat(state.get('visible')))
      .set('visible', List())

}, initialState);

export default reducer;
