import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { createRecord, initialState } from '../helpers/resourceManager';

import { actionTypes as authActionTypes } from './auth';
import { actionTypes as groupsActionTypes } from './groups';

const resourceName = 'users';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const loadUserData = actions.pushResource;
export const fetchUserIfNeeded = actions.fetchIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  // [authActionTypes.LOGIN_SUCCESS]: (state, { payload }) =>
  'recodex/auth/LOGIN_FULFILLED': (state, { payload }) =>
    state.setIn([ 'resources', payload.user.id ], createRecord(false, false, false, payload.user)),

  [groupsActionTypes.LOAD_USERS_GROUPS_FULFILLED]: (state, { payload: { stats }, meta: { userId } }) =>
    state.setIn([ 'resources', userId, 'data', 'groupsStats' ], stats),

  [groupsActionTypes.JOIN_GROUP_PENDING]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'studentOf'], list => list.push(groupId));
  },

  [groupsActionTypes.JOIN_GROUP_REJECTED]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'studentOf'], list => list.filter(id => id !== groupId));
  },

  [groupsActionTypes.LEAVE_GROUP_PENDING]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'studentOf'], list => list.filter(id => id !== groupId));
  },

  [groupsActionTypes.LEAVE_GROUP_REJECTED]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'studentOf'], list => list.push(groupId));
  },

  [groupsActionTypes.MAKE_SUPERVISOR_PENDING]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'supervisorOf'], list => list.push(groupId));
  },

  [groupsActionTypes.MAKE_SUPERVISOR_REJECTED]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'supervisorOf'], list => list.filter(id => id !== groupId));
  },

  [groupsActionTypes.REMOVE_SUPERVISOR_PENDING]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'supervisorOf'], list => list.filter(id => id !== groupId));
  },

  [groupsActionTypes.REMOVE_SUPERVISOR_REJECTED]: (state, { meta: { groupId, userId } }) => {
    if (!state.getIn(['resources', userId])) {
      return state;
    }

    return state.updateIn(['resources', userId, 'data', 'groups', 'supervisorOf'], list => list.push(groupId));
  }

}), initialState);

export default reducer;
