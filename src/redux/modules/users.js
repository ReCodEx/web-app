import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { createRecord } from '../helpers/resourceManager';
import { actionTypes as authActionTypes } from './auth';

const resourceName = 'users';
const {
  actions,
  reducer
} = factory(
  resourceName,
  state => state.users,
  id => `/users/${id}`,
  {
    // [authActionTypes.LOGIN_SUCCESS]: (state, { payload }) =>
    'auth/LOGIN_FULFILLED': (state, { payload }) =>
      state.set(payload.user.id, createRecord(false, false, false, payload.user))
  }
);

/**
 * Actions
 */

export const loadUserData = actions.pushResource;
export const fetchUserIfNeeded = actions.fetchIfNeeded;

/**
 * Reducer
 */

export const initialState = Map();

export default reducer;
