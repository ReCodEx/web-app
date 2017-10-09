import { handleActions } from 'redux-actions';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { additionalActionTypes as groupsActionTypes } from './groups';
import { actionTypes as emailVerificationActionTypes } from './emailVerification';

export const additionalActionTypes = {
  VALIDATE_REGISTRATION_DATA: 'recodex/users/VALIDATE_REGISTRATION_DATA',
  VALIDATE_REGISTRATION_DATA_PENDING:
    'recodex/users/VALIDATE_REGISTRATION_DATA_PENDING',
  VALIDATE_REGISTRATION_DATA_FULFILLED:
    'recodex/users/VALIDATE_REGISTRATION_DATA_FULFILLED',
  VALIDATE_REGISTRATION_DATA_FAILED:
    'recodex/users/VALIDATE_REGISTRATION_DATA_FAILED',
  UPDATE_PROFILE: 'recodex/users/UPDATE_PROFILE',
  UPDATE_PROFILE_PENDING: 'recodex/users/UPDATE_PROFILE_PENDING',
  UPDATE_PROFILE_FULFILLED: 'recodex/users/UPDATE_PROFILE_FULFILLED',
  UPDATE_PROFILE_FAILED: 'recodex/users/UPDATE_PROFILE_FAILED',
  UPDATE_SETTINGS: 'recodex/users/UPDATE_SETTINGS',
  UPDATE_SETTINGS_PENDING: 'recodex/users/UPDATE_SETTINGS_PENDING',
  UPDATE_SETTINGS_FULFILLED: 'recodex/users/UPDATE_SETTINGS_FULFILLED',
  UPDATE_SETTINGS_FAILED: 'recodex/users/UPDATE_SETTINGS_FAILED'
};

const resourceName = 'users';
var { actions, actionTypes, reduceActions } = factory({ resourceName });

export { actionTypes };

/**
 * Actions
 */

export const fetchAllUsers = actions.fetchMany({
  endpoint: '/users'
});
export const loadUserData = actions.pushResource;
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
        ['resources', userId, 'data', 'groups', 'studentOf'],
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
        ['resources', userId, 'data', 'groups', 'studentOf'],
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
        ['resources', userId, 'data', 'groups', 'studentOf'],
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
        ['resources', userId, 'data', 'groups', 'studentOf'],
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
        ['resources', userId, 'data', 'groups', 'supervisorOf'],
        list => list.push(groupId)
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
        ['resources', userId, 'data', 'groups', 'supervisorOf'],
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
        ['resources', userId, 'data', 'groups', 'supervisorOf'],
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
        ['resources', userId, 'data', 'groups', 'supervisorOf'],
        list => list.push(groupId)
      );
    }
  }),
  initialState
);

export default reducer;
