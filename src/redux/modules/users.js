import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { additionalActionTypes as groupsActionTypes } from './groups';
import { actionTypes as authActionTypes } from './auth';

const resourceName = 'users';
var {
  actions,
  actionTypes,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const loadUserData = actions.pushResource;
export const fetchUserIfNeeded = actions.fetchIfNeeded;
export const validateRegistrationData = (email, password) =>
  createApiAction({
    type: 'VALIDATE_REGISTRATION_DATA',
    endpoint: '/users/validate-registration-data',
    method: 'POST',
    body: { email, password }
  });

export const fetchSupervisors = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/supervisors`
  });

export const fetchStudents = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/students`
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

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
