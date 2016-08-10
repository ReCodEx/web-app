import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

export const actionTypes = {
  TOGGLE_VISIBILITY: 'sidebar/TOGGLE_VISIBILITY',
  TOGGLE_SIZE: 'sidebar/TOGGLE_SIZE'
};

const initialState = fromJS({
  visible: false,
  collapsed: false
});

export default handleActions({
  [actionTypes.TOGGLE_VISIBILITY]: (state) =>
    state.update('visible', visible => !visible),

  [actionTypes.TOGGLE_SIZE]: (state) =>
    state.update('collapsed', collapsed => !collapsed)

}, initialState);

export const toggleVisibility = createAction(actionTypes.TOGGLE_VISIBILITY);
export const toggleSize = createAction(actionTypes.TOGGLE_SIZE);
