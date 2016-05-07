import { createAction, handleActions } from 'redux-actions';

export const actionTypes = {
  TOGGLE_VISIBILITY: 'sidebar/TOGGLE_VISIBILITY',
  TOGGLE_SIZE: 'sidebar/TOGGLE_SIZE'
};

const initialState = {
  visible: false,
  collapsed: false
};

export default handleActions({
  [actionTypes.TOGGLE_VISIBILITY]: (state) => ({
    ...state,
    visible: !state.visible
  }),
  [actionTypes.TOGGLE_SIZE]: (state) => ({
    ...state,
    collapsed: !state.collapsed
  })
}, initialState);

export const toggleVisibility = createAction(actionTypes.TOGGLE_VISIBILITY);
export const toggleSize = createAction(actionTypes.TOGGLE_SIZE);
