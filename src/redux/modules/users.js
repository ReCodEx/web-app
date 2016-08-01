import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { createRecord, initialState } from '../helpers/resourceManager';
import { actionTypes as authActionTypes } from './auth';

const resourceName = 'users';
const {
  actions,
  reduceActions
} = factory(
  resourceName,
  state => state.users,
  id => `/users/${id}`
);

/**
 * Actions
 */

export const loadUserData = actions.pushResource;
export const fetchUserIfNeeded = actions.fetchIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  'recodex/auth/LOGIN_FULFILLED': (state, { payload }) =>
    state.set(payload.user.id, createRecord(false, false, false, payload.user))

}), initialState);

export default reducer;
