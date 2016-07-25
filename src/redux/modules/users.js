import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';
import { apiCall } from '../api';

/**
 * Actions
 */

export const actionTypes = {
  LOAD_DATA: 'user/LOAD_DATA',
  LOAD_DATA_REQUEST: 'user/LOAD_DATA_PENDING',
  LOAD_DATA_SUCCESS: 'user/LOAD_DATA_FULFILLED',
  LOAD_DATA_FAILIURE: 'user/LOAD_DATA_REJECTED'
};

export const fetchUserData = (id) =>
  apiCall({
    type: actionTypes.LOAD_DATA,
    method: 'GET',
    endpoint: `/users/${id}`
  });

export const loadUserData = (user) =>
  createAction(actionTypes.LOAD_DATA_SUCCESS, user);

/**
 * Reducer
 */

export const initialState = Map();

const reducer = handleActions({

  [actionTypes.LOAD_DATA_REQUEST]: (state, action) =>
    state.set(action.payload.id, {
      loading: true,
      error: false,
      data: null
    }),

  [actionTypes.LOAD_DATA_SUCCESS]: (state, action) =>
    state.set(action.payload.id, {
      loading: false,
      error: false,
      data: action.payload
    }),

  [actionTypes.LOAD_DATA_FAILIURE]: (state, action) =>
    state.set(action.payload.id, {
      loading: false,
      error: true,
      data: null
    })

}, initialState);
export default reducer;
