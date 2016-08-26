import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord } from '../helpers/resourceManager';

const resourceName = 'groups';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  LOAD_GROUPS: 'recodex/groups/LOAD_GROUPS',
  LOAD_GROUPS_PENDING: 'recodex/groups/LOAD_GROUPS_PENDING',
  LOAD_GROUPS_FULFILLED: 'recodex/groups/LOAD_GROUPS_FULFILLED',
  LOAD_GROUPS_REJECTED: 'recodex/groups/LOAD_GROUPS_REJECTED',
  LOAD_USERS_GROUPS: 'recodex/groups/LOAD_USERS_GROUPS',
  LOAD_USERS_GROUPS_PENDING: 'recodex/groups/LOAD_USERS_GROUPS_PENDING',
  LOAD_USERS_GROUPS_FULFILLED: 'recodex/groups/LOAD_USERS_GROUPS_FULFILLED',
  LOAD_USERS_GROUPS_REJECTED: 'recodex/groups/LOAD_USERS_GROUPS_REJECTED',
  JOIN_GROUP: 'recodex/groups/JOIN_GROUP',
  JOIN_GROUP_PENDING: 'recodex/groups/JOIN_GROUP_PENDING',
  JOIN_GROUP_FULFILLED: 'recodex/groups/JOIN_GROUP_FULFILLED',
  JOIN_GROUP_REJECTED: 'recodex/groups/JOIN_GROUP_REJECTED',
  LEAVE_GROUP: 'recodex/groups/LEAVE_GROUP',
  LEAVE_GROUP_PENDING: 'recodex/groups/LEAVE_GROUP_PENDING',
  LEAVE_GROUP_FULFILLED: 'recodex/groups/LEAVE_GROUP_FULFILLED',
  LEAVE_GROUP_REJECTED: 'recodex/groups/LEAVE_GROUP_REJECTED',
  MAKE_SUPERVISOR: 'recodex/groups/MAKE_SUPERVISOR',
  MAKE_SUPERVISOR_PENDING: 'recodex/groups/MAKE_SUPERVISOR_PENDING',
  MAKE_SUPERVISOR_FULFILLED: 'recodex/groups/MAKE_SUPERVISOR_FULFILLED',
  MAKE_SUPERVISOR_REJECTED: 'recodex/groups/MAKE_SUPERVISOR_REJECTED',
  REMOVE_SUPERVISOR: 'recodex/groups/REMOVE_SUPERVISOR',
  REMOVE_SUPERVISOR_PENDING: 'recodex/groups/REMOVE_SUPERVISOR_PENDING',
  REMOVE_SUPERVISOR_FULFILLED: 'recodex/groups/REMOVE_SUPERVISOR_FULFILLED',
  REMOVE_SUPERVISOR_REJECTED: 'recodex/groups/REMOVE_SUPERVISOR_REJECTED'
};

export const loadGroup = actions.pushResource;
export const fetchGroupsIfNeeded = actions.fetchIfNeeded;
export const fetchGroupIfNeeded = actions.fetchOneIfNeeded;

export const fetchUsersGroups = (userId) =>
  createApiAction({
    type: actionTypes.LOAD_USERS_GROUPS,
    endpoint: `/users/${userId}/groups`,
    method: 'GET',
    meta: { userId }
  });

export const fetchInstanceGroupsIfNeeded = (instanceId) =>
  // @todo: determine whether to load the list for the instance or not instead of loading it always
  createApiAction({
    type: actionTypes.LOAD_GROUPS,
    endpoint: `/instances/${instanceId}/groups`,
    method: 'GET',
    meta: { instanceId }
  });

export const fetchUsersGroupsIfNeeded = (userId) =>
  (dispatch, getState) => {
    const user = getState().users.getIn(['resources', userId]);
    if (user) {
      // @todo: better caching!!
      dispatch(fetchUsersGroups(userId));
    }
  };

export const joinGroup = (groupId, userId) =>
  createApiAction({
    type: actionTypes.JOIN_GROUP,
    url: `/groups/${groupId}/students/${userId}`,
    method: 'POST'
  });

export const leaveGroup = (groupId, userId) =>
  createApiAction({
    type: actionTypes.LEAVE_GROUP,
    url: `/groups/${groupId}/students/${userId}`,
    method: 'DELETE'
  });

export const makeSupervisor = (groupId, userId) =>
  createApiAction({
    type: actionTypes.MAKE_SUPERVISOR,
    url: `/groups/${groupId}/supervisors/${userId}`,
    method: 'POST'
  });

export const removeSupervisor = (groupId, userId) =>
  createApiAction({
    type: actionTypes.REMOVE_SUPERVISOR,
    url: `/groups/${groupId}/supervisors/${userId}`,
    method: 'DELETE'
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.LOAD_GROUPS_FULFILLED]: (state, { payload }) => {
    return payload.reduce((state, group) => state.setIn(['resources', group.id], createRecord(false, false, false, group)), state);
  },

  [actionTypes.LOAD_USERS_GROUPS_FULFILLED]: (state, { payload }) => {
    const groups = [ ...payload.supervisor, ...payload.student ];
    return groups.reduce((state, group) => state.setIn(['resources', group.id], createRecord(false, false, false, group)), state);
  }

}), initialState);

export default reducer;
