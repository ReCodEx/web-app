import { handleActions } from 'redux-actions';
import { Map, fromJS } from 'immutable';

import { addNotification } from './notifications';
import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';

import createRecord from '../helpers/resourceManager/recordFactory';
import { resourceStatus } from '../helpers/resourceManager/status';
import { actionTypes as assignmentsActionTypes } from './assignments';
import {
  actionTypes as invitationsActionTypes,
  additionalActionTypes as additionalInvitationsActionTypes,
} from './groupInvitations';
import { actionTypes as shadowAssignmentsActionTypes } from './shadowAssignments';
import { actionTypes as sisSupervisedCoursesActionTypes } from './sisSupervisedCoursesTypes';
import { actionTypes as sisSubscribedCoursesActionTypes } from './sisSubscribedGroups';
import { actionTypes as sisPossibleParentsActionTypes } from './sisPossibleParents';
import { selectedInstanceId } from '../selectors/auth';

import { objectMap, arrayToObject } from '../../helpers/common';

const resourceName = 'groups';
const { actions, actionTypes, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export { actionTypes };

export const additionalActionTypes = {
  JOIN_GROUP: 'recodex/groups/JOIN_GROUP',
  JOIN_GROUP_PENDING: 'recodex/groups/JOIN_GROUP_PENDING',
  JOIN_GROUP_FULFILLED: 'recodex/groups/JOIN_GROUP_FULFILLED',
  JOIN_GROUP_REJECTED: 'recodex/groups/JOIN_GROUP_REJECTED',
  LEAVE_GROUP: 'recodex/groups/LEAVE_GROUP',
  LEAVE_GROUP_PENDING: 'recodex/groups/LEAVE_GROUP_PENDING',
  LEAVE_GROUP_FULFILLED: 'recodex/groups/LEAVE_GROUP_FULFILLED',
  LEAVE_GROUP_REJECTED: 'recodex/groups/LEAVE_GROUP_REJECTED',
  ADD_MEMBER: 'recodex/groups/ADD_MEMBER',
  ADD_MEMBER_PENDING: 'recodex/groups/ADD_MEMBER_PENDING',
  ADD_MEMBER_FULFILLED: 'recodex/groups/ADD_MEMBER_FULFILLED',
  ADD_MEMBER_REJECTED: 'recodex/groups/ADD_MEMBER_REJECTED',
  REMOVE_MEMBER: 'recodex/groups/REMOVE_MEMBER',
  REMOVE_MEMBER_PENDING: 'recodex/groups/REMOVE_MEMBER_PENDING',
  REMOVE_MEMBER_FULFILLED: 'recodex/groups/REMOVE_MEMBER_FULFILLED',
  REMOVE_MEMBER_REJECTED: 'recodex/groups/REMOVE_MEMBER_REJECTED',
  SET_ORGANIZATIONAL: 'recodex/groups/SET_ORGANIZATIONAL',
  SET_ORGANIZATIONAL_PENDING: 'recodex/groups/SET_ORGANIZATIONAL_PENDING',
  SET_ORGANIZATIONAL_FULFILLED: 'recodex/groups/SET_ORGANIZATIONAL_FULFILLED',
  SET_ORGANIZATIONAL_REJECTED: 'recodex/groups/SET_ORGANIZATIONAL_REJECTED',
  SET_ARCHIVED: 'recodex/groups/SET_ARCHIVED',
  SET_ARCHIVED_PENDING: 'recodex/groups/SET_ARCHIVED_PENDING',
  SET_ARCHIVED_FULFILLED: 'recodex/groups/SET_ARCHIVED_FULFILLED',
  SET_ARCHIVED_REJECTED: 'recodex/groups/SET_ARCHIVED_REJECTED',
  RELOCATE: 'recodex/groups/RELOCATE',
  RELOCATE_PENDING: 'recodex/groups/RELOCATE_PENDING',
  RELOCATE_FULFILLED: 'recodex/groups/RELOCATE_FULFILLED',
  RELOCATE_REJECTED: 'recodex/groups/RELOCATE_REJECTED',
};

export const loadGroup = actions.pushResource;
export const fetchGroupsIfNeeded = actions.fetchIfNeeded;
export const fetchGroup = actions.fetchResource;
export const fetchGroupIfNeeded = actions.fetchOneIfNeeded;

const prepareFetchGroupsParams = params => {
  const known = {
    instanceId: null,
    ancestors: false,
    search: null,
    archived: false,
    onlyArchived: false,
  };
  const res = { ancestors: true };
  if (params) {
    for (const key in known) {
      if (params[key] !== undefined && params[key] !== known[key]) {
        res[key] = params[key];
      }
    }
  }
  return objectMap(res, val => (typeof val === 'boolean' ? Number(val) : val));
};

export const fetchAllGroupsEndpoint = '/groups';

export const fetchAllGroups = params => (dispatch, getState) =>
  dispatch(
    actions.fetchMany({
      endpoint: fetchAllGroupsEndpoint,
      query: prepareFetchGroupsParams({
        instanceId: selectedInstanceId(getState()),
        ...params,
      }),
    })
  );

// TODO fetchGroupsIfNeeded would be nice to have ...

export const validateAddGroup = (name, instanceId, parentGroupId = null) =>
  createApiAction({
    type: 'VALIDATE_ADD_GROUP_DATA',
    endpoint: '/groups/validate-add-group-data',
    method: 'POST',
    body: parentGroupId === null ? { name, instanceId } : { name, instanceId, parentGroupId },
  });

export const createGroup = actions.addResource;
export const editGroup = actions.updateResource;
export const deleteGroup = actions.removeResource;

export const joinGroup = (groupId, userId) => dispatch =>
  dispatch(
    createApiAction({
      type: additionalActionTypes.JOIN_GROUP,
      endpoint: `/groups/${groupId}/students/${userId}`,
      method: 'POST',
      meta: { groupId, userId },
    })
  ).catch(() => dispatch(addNotification('Cannot join group.', false))); // @todo: Make translatable

export const leaveGroup = (groupId, userId) => dispatch =>
  dispatch(
    createApiAction({
      type: additionalActionTypes.LEAVE_GROUP,
      endpoint: `/groups/${groupId}/students/${userId}`,
      method: 'DELETE',
      meta: { groupId, userId },
    })
  ).catch(() => dispatch(addNotification('Cannot leave group.', false))); // @todo: Make translatable

// add member of any type except student
const addMember = type => (groupId, userId) => dispatch =>
  dispatch(
    createApiAction({
      type: additionalActionTypes.ADD_MEMBER,
      endpoint: `/groups/${groupId}/members/${userId}`,
      method: 'POST',
      meta: { groupId, userId, type },
      body: { type },
    })
  ).catch(() => dispatch(addNotification(`Cannot make this person ${type} of the group.`, false))); // @todo: Make translatable

export const addAdmin = addMember('admin');
export const addSupervisor = addMember('supervisor');
export const addObserver = addMember('observer');

// remove member of any type except student
export const removeMember = (groupId, userId) => dispatch =>
  dispatch(
    createApiAction({
      type: additionalActionTypes.REMOVE_MEMBER,
      endpoint: `/groups/${groupId}/members/${userId}`,
      method: 'DELETE',
      meta: { groupId, userId },
    })
  ).catch(() => dispatch(addNotification('Cannot remove group member.', false))); // @todo: Make translatable

export const setOrganizational = (groupId, organizational) =>
  createApiAction({
    type: additionalActionTypes.SET_ORGANIZATIONAL,
    method: 'POST',
    endpoint: `/groups/${groupId}/organizational`,
    body: { value: organizational },
    meta: { groupId },
  });

export const setArchived = (groupId, archived) =>
  createApiAction({
    type: additionalActionTypes.SET_ARCHIVED,
    method: 'POST',
    endpoint: `/groups/${groupId}/archived`,
    body: { value: archived },
    meta: { groupId },
  });

export const relocateGroup = (groupId, newParentId) =>
  createApiAction({
    type: additionalActionTypes.RELOCATE,
    method: 'POST',
    endpoint: `/groups/${groupId}/relocate/${newParentId}`,
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ADD_FULFILLED]: (state, action) => {
      if (reduceActions[actionTypes.ADD_FULFILLED]) {
        state = reduceActions[actionTypes.ADD_FULFILLED](state, action);
      }

      // update the new hierarchy inside the local state
      const { payload: group } = action;
      if (group.parentGroupId === null || !state.getIn(['resources', group.parentGroupId])) {
        return state;
      }

      return state.updateIn(['resources', group.parentGroupId, 'data', 'childGroups'], children =>
        children.push(group.id)
      );
    },

    [actionTypes.REMOVE_FULFILLED]: (state, action) => {
      const removeFulfilled = reduceActions[actionTypes.REMOVE_FULFILLED];
      return removeFulfilled(state, action).update('resources', groups =>
        groups.map(group =>
          group.get('data') !== null
            ? group.updateIn(['data', 'childGroups'], children =>
                children.filter(groupId => groupId !== action.meta.id)
              )
            : null
        )
      );
    },

    [additionalActionTypes.JOIN_GROUP_PENDING]: (state, { meta: { groupId, userId } }) =>
      state.hasIn(['resources', groupId, 'data', 'privateData', 'students'])
        ? state.updateIn(['resources', groupId, 'data', 'privateData', 'students'], students => students.push(userId))
        : state,

    [additionalActionTypes.JOIN_GROUP_REJECTED]: (state, { meta: { groupId, userId } }) =>
      state.hasIn(['resources', groupId, 'data', 'privateData', 'students'])
        ? state.updateIn(['resources', groupId, 'data', 'privateData', 'students'], students =>
            students.filter(id => id !== userId)
          )
        : state,

    [additionalActionTypes.LEAVE_GROUP_FULFILLED]: (state, { meta: { groupId, userId } }) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'students'], students =>
        students.filter(id => id !== userId)
      ),

    [additionalActionTypes.ADD_MEMBER_PENDING]: (state, { meta: { groupId, userId } }) =>
      state.hasIn(['resources', groupId, 'pending-membership'])
        ? state.updateIn(['resources', groupId, 'pending-membership'], memberships => memberships.push(userId))
        : state.setIn(['resources', groupId, 'pending-membership'], fromJS([userId])),

    [additionalActionTypes.ADD_MEMBER_REJECTED]: (state, { meta: { groupId, userId } }) =>
      state.updateIn(['resources', groupId, 'pending-membership'], memberships =>
        memberships.filter(id => id !== userId)
      ),

    [additionalActionTypes.ADD_MEMBER_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
      state
        .setIn(['resources', groupId, 'data'], fromJS(payload))
        .updateIn(['resources', groupId, 'pending-membership'], memberships => memberships.filter(id => id !== userId)),

    [additionalActionTypes.REMOVE_MEMBER_PENDING]: (state, { meta: { groupId, userId } }) =>
      state.hasIn(['resources', groupId, 'pending-membership'])
        ? state.updateIn(['resources', groupId, 'pending-membership'], memberships => memberships.push(userId))
        : state.setIn(['resources', groupId, 'pending-membership'], fromJS([userId])),

    [additionalActionTypes.REMOVE_MEMBER_REJECTED]: (state, { meta: { groupId, userId } }) =>
      state.updateIn(['resources', groupId, 'pending-membership'], memberships =>
        memberships.filter(id => id !== userId)
      ),

    [additionalActionTypes.REMOVE_MEMBER_FULFILLED]: (state, { payload, meta: { groupId, userId } }) =>
      state
        .setIn(['resources', groupId, 'data'], fromJS(payload))
        .updateIn(['resources', groupId, 'pending-membership'], memberships => memberships.filter(id => id !== userId)),

    [additionalActionTypes.SET_ORGANIZATIONAL_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['resources', groupId, 'pending-organizational'], true),

    [additionalActionTypes.SET_ORGANIZATIONAL_FULFILLED]: (state, { payload, meta: { groupId } }) =>
      state
        .deleteIn(['resources', groupId, 'pending-organizational'])
        .setIn(['resources', groupId, 'data'], fromJS(payload)),

    [additionalActionTypes.SET_ORGANIZATIONAL_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-organizational']),

    [additionalActionTypes.SET_ARCHIVED_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['resources', groupId, 'pending-archived'], true),

    [additionalActionTypes.SET_ARCHIVED_FULFILLED]: (state, { payload, meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-archived']).setIn(['resources', groupId, 'data'], fromJS(payload)),

    [additionalActionTypes.SET_ARCHIVED_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-archived']),

    [additionalActionTypes.RELOCATE_FULFILLED]: (state, { payload }) =>
      payload.reduce(
        (state, data) => state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),
        state
      ),

    [assignmentsActionTypes.UPDATE_FULFILLED]: (state, { payload: { id: assignmentId, groupId } }) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'assignments'], assignments =>
        assignments.push(assignmentId).toSet().toList()
      ),

    [assignmentsActionTypes.ADD_FULFILLED]: (
      state,
      {
        payload: { id: assignmentId },
        meta: {
          body: { groupId },
        },
      }
    ) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'assignments'], assignments =>
        assignments.push(assignmentId).toSet().toList()
      ),

    [assignmentsActionTypes.REMOVE_FULFILLED]: (state, { meta: { id: assignmentId } }) =>
      state.update('resources', groups =>
        groups.map(group =>
          group.updateIn(['data', 'privateData', 'assignments'], assignments =>
            assignments.filter(id => id !== assignmentId)
          )
        )
      ),

    [shadowAssignmentsActionTypes.UPDATE_FULFILLED]: (state, { payload: { id: shadowAssignmentId, groupId } }) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'shadowAssignments'], assignments =>
        assignments.push(shadowAssignmentId).toSet().toList()
      ),

    [shadowAssignmentsActionTypes.ADD_FULFILLED]: (state, { payload: { id: shadowAssignmentId, groupId } }) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'shadowAssignments'], assignments =>
        assignments.push(shadowAssignmentId).toSet().toList()
      ),

    [shadowAssignmentsActionTypes.REMOVE_FULFILLED]: (state, { meta: { id: shadowAssignmentId } }) =>
      state.update('resources', groups =>
        groups.map(group =>
          group.updateIn(['data', 'privateData', 'shadowAssignments'], assignments =>
            assignments.filter(id => id !== shadowAssignmentId)
          )
        )
      ),

    [sisSupervisedCoursesActionTypes.CREATE_FULFILLED]: (state, { payload: data }) =>
      state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [sisSupervisedCoursesActionTypes.BIND_FULFILLED]: (state, { payload: data }) =>
      state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [sisSupervisedCoursesActionTypes.UNBIND_FULFILLED]: (state, { meta: { courseId, groupId } }) =>
      state.updateIn(['resources', groupId, 'data', 'privateData', 'bindings', 'sis'], bindings =>
        bindings.filter(binding => binding !== courseId)
      ),

    [sisSupervisedCoursesActionTypes.FETCH_FULFILLED]: (state, { payload: { groups } }) =>
      state.update('resources', oldGroups =>
        oldGroups.merge(
          new Map(
            arrayToObject(
              groups,
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),

    [sisSubscribedCoursesActionTypes.FETCH_FULFILLED]: (state, { payload: { groups } }) =>
      state.update('resources', oldGroups =>
        oldGroups.merge(
          new Map(
            arrayToObject(
              groups,
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),

    [sisPossibleParentsActionTypes.FETCH_FULFILLED]: (state, { payload: groups }) =>
      state.update('resources', oldGroups =>
        oldGroups.merge(
          new Map(
            arrayToObject(
              groups,
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),

    [invitationsActionTypes.FETCH_FULFILLED]: (state, { payload: { groups } }) =>
      state.update('resources', oldGroups =>
        oldGroups.merge(
          new Map(
            arrayToObject(
              groups,
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),

    [additionalInvitationsActionTypes.ACCEPT_INVITATION_FULFILLED]: (state, { payload: data }) =>
      state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),
  }),
  initialState
);

export default reducer;
