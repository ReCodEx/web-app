import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { additionalActionTypes as groupsActionTypes } from './groups';
import { actionTypes as sisSupervisedCoursesActionTypes } from './sisSupervisedCourses';
import { actionTypes as emailVerificationActionTypes } from './emailVerification';

export const additionalActionTypes = {
  VALIDATE_REGISTRATION_DATA: 'recodex/users/VALIDATE_REGISTRATION_DATA',
  VALIDATE_REGISTRATION_DATA_PENDING:
    'recodex/users/VALIDATE_REGISTRATION_DATA_PENDING',
  VALIDATE_REGISTRATION_DATA_FULFILLED:
    'recodex/users/VALIDATE_REGISTRATION_DATA_FULFILLED',
  VALIDATE_REGISTRATION_DATA_REJECTED:
    'recodex/users/VALIDATE_REGISTRATION_DATA_REJECTED',
  UPDATE_PROFILE: 'recodex/users/UPDATE_PROFILE',
  UPDATE_PROFILE_PENDING: 'recodex/users/UPDATE_PROFILE_PENDING',
  UPDATE_PROFILE_FULFILLED: 'recodex/users/UPDATE_PROFILE_FULFILLED',
  UPDATE_PROFILE_REJECTED: 'recodex/users/UPDATE_PROFILE_REJECTED',
  UPDATE_SETTINGS: 'recodex/users/UPDATE_SETTINGS',
  UPDATE_SETTINGS_PENDING: 'recodex/users/UPDATE_SETTINGS_PENDING',
  UPDATE_SETTINGS_FULFILLED: 'recodex/users/UPDATE_SETTINGS_FULFILLED',
  UPDATE_SETTINGS_REJECTED: 'recodex/users/UPDATE_SETTINGS_REJECTED',
  CREATE_LOCAL_LOGIN: 'recodex/users/CREATE_LOCAL_LOGIN',
  CREATE_LOCAL_LOGIN_PENDING: 'recodex/users/CREATE_LOCAL_LOGIN_PENDING',
  CREATE_LOCAL_LOGIN_FULFILLED: 'recodex/users/CREATE_LOCAL_LOGIN_FULFILLED',
  CREATE_LOCAL_LOGIN_REJECTED: 'recodex/users/CREATE_LOCAL_LOGIN_REJECTED'
};

const resourceName = 'users';
var { actions, actionTypes, reduceActions } = factory({ resourceName });

export { actionTypes };

/**
 * Actions
 */

export const fetchManyEndpoint = '/users';

export const fetchAllUsers = actions.fetchMany({
  endpoint: fetchManyEndpoint
});
export const loadUserData = actions.pushResource;
export const fetchUser = actions.fetchResource;
export const fetchUserIfNeeded = actions.fetchIfNeeded;
export const validateRegistrationData = (email, password) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_REGISTRATION_DATA,
    endpoint: '/users/validate-registration-data',
    method: 'POST',
    body: { email, password }
  });

export const updateProfile = actions.updateResource;
export const updateSettings = (id, body) =>
  actions.updateResource(id, body, `/users/${id}/settings`);
export const deleteUser = actions.removeResource;

export const fetchSupervisors = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/supervisors`
  });

export const fetchStudents = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/students`
  });

export const makeLocalLogin = id =>
  createApiAction({
    type: additionalActionTypes.CREATE_LOCAL_LOGIN,
    endpoint: `/users/${id}/create-local`,
    method: 'POST',
    meta: { id }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [emailVerificationActionTypes.EMAIL_VERIFICATION_FULFILLED]: (
      state,
      { meta: { userId } }
    ) =>
      state.hasIn(['resources', userId])
        ? state.updateIn(
            ['resources', userId, 'data'],
            userData =>
              userData === null ? null : userData.set('isVerified', true)
          )
        : state,

    [groupsActionTypes.JOIN_GROUP_PENDING]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'studentOf'],
        list => list.push(groupId)
      );
    },

    [groupsActionTypes.JOIN_GROUP_REJECTED]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'studentOf'],
        list => list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.LEAVE_GROUP_PENDING]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'studentOf'],
        list => list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.LEAVE_GROUP_REJECTED]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'studentOf'],
        list => list.push(groupId)
      );
    },

    [groupsActionTypes.MAKE_SUPERVISOR_PENDING]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'],
        list => list.push(groupId)
      );
    },

    [sisSupervisedCoursesActionTypes.CREATE_FULFILLED]: (
      state,
      { meta: { userId }, payload }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'],
        list => list.push(payload.id)
      );
    },

    [groupsActionTypes.MAKE_SUPERVISOR_REJECTED]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'],
        list => list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.REMOVE_SUPERVISOR_PENDING]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'],
        list => list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.REMOVE_SUPERVISOR_REJECTED]: (
      state,
      { meta: { groupId, userId } }
    ) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(
        ['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'],
        list => list.push(groupId)
      );
    },

    [additionalActionTypes.CREATE_LOCAL_LOGIN_PENDING]: (
      state,
      { meta: { id } }
    ) => state.setIn(['resources', id, 'data', 'privateData', 'isLocal'], true),

    [additionalActionTypes.CREATE_LOCAL_LOGIN_REJECTED]: (
      state,
      { meta: { id } }
    ) =>
      state.setIn(['resources', id, 'data', 'privateData', 'isLocal'], false),

    [additionalActionTypes.CREATE_LOCAL_LOGIN_FULFILLED]: (
      state,
      { payload, meta: { id } }
    ) => state.setIn(['resources', id, 'data'], fromJS(payload))
  }),
  initialState
);

export default reducer;
