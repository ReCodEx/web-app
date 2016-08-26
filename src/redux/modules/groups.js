import { createAction, handleActions } from 'redux-actions';
import { fromJS, Map } from 'immutable';

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
    endpoint: `/groups/${groupId}/students/${userId}`,
    method: 'POST',
    meta: { groupId, userId }
  });

export const leaveGroup = (groupId, userId) =>
  createApiAction({
    type: actionTypes.LEAVE_GROUP,
    endpoint: `/groups/${groupId}/students/${userId}`,
    method: 'DELETE',
    meta: { groupId, userId }
  });

export const makeSupervisor = (groupId, userId) =>
  createApiAction({
    type: actionTypes.MAKE_SUPERVISOR,
    endpoint: `/groups/${groupId}/supervisors/${userId}`,
    method: 'POST',
    meta: { groupId, userId }
  });

export const removeSupervisor = (groupId, userId) =>
  createApiAction({
    type: actionTypes.REMOVE_SUPERVISOR,
    endpoint: `/groups/${groupId}/supervisors/${userId}`,
    method: 'DELETE',
    meta: { groupId, userId }
  });

/**
 * Reducer
 */

const loadedGroupRecord = group => createRecord(false, false, false, group);

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.JOIN_GROUP_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
    state.updateIn(['resources', groupId, 'data', 'students'], students =>
      students.push(
        fromJS(payload.students.find(user => user.id === userId))
      )
    ),

  [actionTypes.LEAVE_GROUP_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
    state.updateIn(['resources', groupId, 'data', 'students'], students =>
      students.filter(user => user.get('id') !== userId)),

  [actionTypes.MAKE_SUPERVISOR_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
    state.updateIn(['resources', groupId, 'data', 'supervisors'], supervisors =>
      supervisors.push(
        fromJS(payload.supervisors.find(user => user.id === userId))
      )
    ),

  [actionTypes.REMOVE_SUPERVISOR_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
    state.updateIn(['resources', groupId, 'data', 'supervisors'], supervisors =>
      supervisors.filter(user => user.get('id') !== userId)),

  [actionTypes.LOAD_GROUPS_FULFILLED]: (state, { payload }) =>
    payload.reduce((state, group) => state.setIn(['resources', group.id], loadedGroupRecord(group)), state),

  [actionTypes.LOAD_USERS_GROUPS_FULFILLED]: (state, { payload }) => {
    const groups = [ ...payload.supervisor, ...payload.student ];
    return groups.reduce((state, group) => state.setIn(['resources', group.id], loadedGroupRecord(group)), state);
  }

}), initialState);

export default reducer;
