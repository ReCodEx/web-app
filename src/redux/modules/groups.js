import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { addNotification } from './notifications.js';
import { createApiAction } from '../middleware/apiMiddleware.js';
import factory, { initialState, createActionsWithPostfixes } from '../helpers/resourceManager';

import createRecord from '../helpers/resourceManager/recordFactory.js';
import { resourceStatus } from '../helpers/resourceManager/status.js';
import { actionTypes as assignmentsActionTypes } from './assignments.js';
import {
  actionTypes as invitationsActionTypes,
  additionalActionTypes as additionalInvitationsActionTypes,
} from './groupInvitations.js';
import { actionTypes as shadowAssignmentsActionTypes } from './shadowAssignments.js';
import { selectedInstanceId } from '../selectors/auth.js';

import { objectMap, arrayToObject } from '../../helpers/common.js';

const resourceName = 'groups';
const { actions, actionTypes, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export { actionTypes };

export const additionalActionTypes = {
  ...createActionsWithPostfixes('JOIN_GROUP', 'recodex/groups'),
  ...createActionsWithPostfixes('LEAVE_GROUP', 'recodex/groups'),
  ...createActionsWithPostfixes('ADD_MEMBER', 'recodex/groups'),
  ...createActionsWithPostfixes('REMOVE_MEMBER', 'recodex/groups'),
  ...createActionsWithPostfixes('SET_ORGANIZATIONAL', 'recodex/groups'),
  ...createActionsWithPostfixes('SET_ARCHIVED', 'recodex/groups'),
  ...createActionsWithPostfixes('SET_EXAM_FLAG', 'recodex/groups'),
  ...createActionsWithPostfixes('SET_EXAM_PERIOD', 'recodex/groups'),
  ...createActionsWithPostfixes('REMOVE_EXAM_PERIOD', 'recodex/groups'),
  ...createActionsWithPostfixes('LOCK_STUDENT_EXAM', 'recodex/groups'),
  ...createActionsWithPostfixes('UNLOCK_STUDENT_EXAM', 'recodex/groups'),
  ...createActionsWithPostfixes('RELOCATE', 'recodex/groups'),
  ...createActionsWithPostfixes('GET_ATTRIBUTES', 'recodex/groups'),
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

export const getGroupAttributes = groupId =>
  createApiAction({
    type: additionalActionTypes.GET_ATTRIBUTES,
    method: 'GET',
    endpoint: `/group-attributes/${groupId}`,
    meta: { groupId },
  });

/*
 * Exam-related stuff
 */

export const setExamFlag = (groupId, value = true) =>
  createApiAction({
    type: additionalActionTypes.SET_EXAM_FLAG,
    method: 'POST',
    endpoint: `/groups/${groupId}/exam`,
    body: { value },
    meta: { groupId },
  });

export const setExamPeriod = (groupId, begin, end = null, strict = undefined) => {
  const body = { begin, end };
  if (strict !== undefined && strict !== null) {
    body.strict = strict;
  }
  return createApiAction({
    type: additionalActionTypes.SET_EXAM_PERIOD,
    method: 'POST',
    endpoint: `/groups/${groupId}/examPeriod`,
    body,
    meta: { groupId },
  });
};

export const removeExamPeriod = groupId =>
  createApiAction({
    type: additionalActionTypes.REMOVE_EXAM_PERIOD,
    method: 'DELETE',
    endpoint: `/groups/${groupId}/examPeriod`,
    meta: { groupId },
  });

export const lockStudentForExam = (groupId, userId) =>
  createApiAction({
    type: additionalActionTypes.LOCK_STUDENT_EXAM,
    method: 'POST',
    endpoint: `/groups/${groupId}/lock/${userId}`,
    meta: { groupId, userId },
  });

export const unlockStudentFromExam = (groupId, userId) =>
  createApiAction({
    type: additionalActionTypes.UNLOCK_STUDENT_EXAM,
    method: 'DELETE',
    endpoint: `/groups/${groupId}/lock/${userId}`,
    meta: { groupId, userId },
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
      state.setIn(['resources', groupId, 'pending-group-type'], true),

    [additionalActionTypes.SET_ORGANIZATIONAL_FULFILLED]: (state, { payload, meta: { groupId } }) =>
      state
        .deleteIn(['resources', groupId, 'pending-group-type'])
        .setIn(['resources', groupId, 'data'], fromJS(payload)),

    [additionalActionTypes.SET_ORGANIZATIONAL_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-group-type']),

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

    [additionalActionTypes.GET_ATTRIBUTES_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['attributes', groupId], createRecord()),

    [additionalActionTypes.GET_ATTRIBUTES_FULFILLED]: (state, { meta: { groupId }, payload: data }) =>
      state.setIn(['attributes', groupId], createRecord({ state: resourceStatus.FULFILLED, data })),

    [additionalActionTypes.GET_ATTRIBUTES_REJECTED]: (state, { meta: { groupId }, payload: error }) =>
      state.setIn(['attributes', groupId], createRecord({ state: resourceStatus.FAILED, error })),

    [additionalActionTypes.SET_EXAM_FLAG_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['resources', groupId, 'pending-group-type'], true),

    [additionalActionTypes.SET_EXAM_FLAG_FULFILLED]: (state, { payload, meta: { groupId } }) =>
      state
        .deleteIn(['resources', groupId, 'pending-group-type'])
        .setIn(['resources', groupId, 'data'], fromJS(payload)),

    [additionalActionTypes.SET_EXAM_FLAG_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-group-type']),

    [additionalActionTypes.SET_EXAM_PERIOD_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['resources', groupId, 'pending-exam-period'], true),

    [additionalActionTypes.SET_EXAM_PERIOD_FULFILLED]: (state, { payload, meta: { groupId } }) =>
      state
        .deleteIn(['resources', groupId, 'pending-exam-period'])
        .setIn(['resources', groupId, 'data'], fromJS(payload)),

    [additionalActionTypes.SET_EXAM_PERIOD_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-exam-period']),

    [additionalActionTypes.REMOVE_EXAM_PERIOD_PENDING]: (state, { meta: { groupId } }) =>
      state.setIn(['resources', groupId, 'pending-exam-period'], true),

    [additionalActionTypes.REMOVE_EXAM_PERIOD_FULFILLED]: (state, { meta: { groupId } }) =>
      state
        .deleteIn(['resources', groupId, 'pending-exam-period'])
        .setIn(['resources', groupId, 'data', 'privateData', 'examBegin'], null)
        .setIn(['resources', groupId, 'data', 'privateData', 'examEnd'], null)
        .setIn(['resources', groupId, 'data', 'privateData', 'examLockStrict'], null),

    [additionalActionTypes.REMOVE_EXAM_PERIOD_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-exam-period']),

    [additionalActionTypes.LOCK_STUDENT_EXAM_PENDING]: (state, { meta: { groupId, userId } }) =>
      state.setIn(['resources', groupId, 'pending-user-lock'], userId),

    [additionalActionTypes.LOCK_STUDENT_EXAM_FULFILLED]: (state, { payload: { group }, meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-user-lock']).setIn(['resources', groupId, 'data'], fromJS(group)),

    [additionalActionTypes.LOCK_STUDENT_EXAM_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-user-lock']),

    [additionalActionTypes.UNLOCK_STUDENT_EXAM_PENDING]: (state, { meta: { groupId, userId } }) =>
      state.setIn(['resources', groupId, 'pending-user-unlock'], userId),

    [additionalActionTypes.UNLOCK_STUDENT_EXAM_FULFILLED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-user-unlock']),

    [additionalActionTypes.UNLOCK_STUDENT_EXAM_REJECTED]: (state, { meta: { groupId } }) =>
      state.deleteIn(['resources', groupId, 'pending-user-unlock']),

    // external actions

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

    [invitationsActionTypes.FETCH_FULFILLED]: (state, { payload: { groups } }) =>
      state.update('resources', oldGroups =>
        oldGroups.merge(
          arrayToObject(
            groups,
            o => o.id,
            data => createRecord({ state: resourceStatus.FULFILLED, data })
          )
        )
      ),

    [additionalInvitationsActionTypes.ACCEPT_INVITATION_FULFILLED]: (state, { payload: data }) =>
      state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),
  }),
  initialState
);

export default reducer;
