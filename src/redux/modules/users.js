import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { additionalActionTypes as groupsActionTypes } from './groups';
import { actionTypes as sisSupervisedCoursesActionTypes } from './sisSupervisedCoursesTypes';
import { actionTypes as emailVerificationActionTypes } from './emailVerification';
import { actionTypes as paginationActionTypes } from './pagination';
import { actionTypes as exercisesAuthorsActionTypes } from './exercisesAuthors';
import { actionTypes as registrationActionTypes } from './registration';
import { actionTypes as authActionTypes } from './authTypes';

import { arrayToObject } from '../../helpers/common';

export const additionalActionTypes = {
  VALIDATE_REGISTRATION_DATA: 'recodex/users/VALIDATE_REGISTRATION_DATA',
  VALIDATE_REGISTRATION_DATA_PENDING: 'recodex/users/VALIDATE_REGISTRATION_DATA_PENDING',
  VALIDATE_REGISTRATION_DATA_FULFILLED: 'recodex/users/VALIDATE_REGISTRATION_DATA_FULFILLED',
  VALIDATE_REGISTRATION_DATA_REJECTED: 'recodex/users/VALIDATE_REGISTRATION_DATA_REJECTED',
  FETCH_BY_IDS: 'recodex/users/FETCH_BY_IDS',
  FETCH_BY_IDS_PENDING: 'recodex/users/FETCH_BY_IDS_PENDING',
  FETCH_BY_IDS_FULFILLED: 'recodex/users/FETCH_BY_IDS_FULFILLED',
  FETCH_BY_IDS_REJECTED: 'recodex/users/FETCH_BY_IDS_REJECTED',
  CREATE_LOCAL_LOGIN: 'recodex/users/CREATE_LOCAL_LOGIN',
  CREATE_LOCAL_LOGIN_PENDING: 'recodex/users/CREATE_LOCAL_LOGIN_PENDING',
  CREATE_LOCAL_LOGIN_FULFILLED: 'recodex/users/CREATE_LOCAL_LOGIN_FULFILLED',
  CREATE_LOCAL_LOGIN_REJECTED: 'recodex/users/CREATE_LOCAL_LOGIN_REJECTED',
  SET_ROLE: 'recodex/users/SET_ROLE',
  SET_ROLE_PENDING: 'recodex/users/SET_ROLE_PENDING',
  SET_ROLE_FULFILLED: 'recodex/users/SET_ROLE_FULFILLED',
  SET_ROLE_REJECTED: 'recodex/users/SET_ROLE_REJECTED',
  SET_IS_ALLOWED: 'recodex/users/SET_IS_ALLOWED',
  SET_IS_ALLOWED_PENDING: 'recodex/users/SET_IS_ALLOWED_PENDING',
  SET_IS_ALLOWED_FULFILLED: 'recodex/users/SET_IS_ALLOWED_FULFILLED',
  SET_IS_ALLOWED_REJECTED: 'recodex/users/SET_IS_ALLOWED_REJECTED',
};

const resourceName = 'users';
const { actions, actionTypes, reduceActions } = factory({ resourceName });

export { actionTypes };

/**
 * Actions
 */

export const fetchManyEndpoint = '/users';

export const loadUserData = actions.pushResource;
export const fetchUser = actions.fetchResource;
export const fetchUserIfNeeded = actions.fetchOneIfNeeded;
export const validateRegistrationData = (email, password) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_REGISTRATION_DATA,
    endpoint: '/users/validate-registration-data',
    method: 'POST',
    body: { email, password },
  });

export const updateProfile = actions.updateResource;
export const updateSettings = (id, body) => actions.updateResource(id, body, `/users/${id}/settings`);
export const updateUiData = (id, uiData) => actions.updateResource(id, { uiData }, `/users/${id}/ui-data`);
export const deleteUser = actions.removeResource;

export const fetchByIds = ids =>
  createApiAction({
    type: additionalActionTypes.FETCH_BY_IDS,
    endpoint: '/users/list',
    method: 'POST',
    meta: { ids },
    body: { ids },
  });

export const makeLocalLogin = id =>
  createApiAction({
    type: additionalActionTypes.CREATE_LOCAL_LOGIN,
    endpoint: `/users/${id}/create-local`,
    method: 'POST',
    meta: { id },
  });

export const setRole = (id, role) =>
  createApiAction({
    type: additionalActionTypes.SET_ROLE,
    endpoint: `/users/${id}/role`,
    method: 'POST',
    meta: { id, role },
    body: { role },
  });

export const setIsAllowed = (id, isAllowed = true) =>
  createApiAction({
    type: additionalActionTypes.SET_IS_ALLOWED,
    endpoint: `/users/${id}/allowed`,
    method: 'POST',
    meta: { id, isAllowed },
    body: { isAllowed },
  });

/**
 * Reducer
 */
const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.UPDATE_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(
        ['resources', id, 'data'],
        fromJS(payload.user && typeof payload.user === 'object' ? payload.user : payload)
      ),

    [additionalActionTypes.FETCH_BY_IDS_PENDING]: (state, { meta: { ids } }) =>
      state.update('resources', users => {
        ids.forEach(id => {
          if (!users.has(id)) {
            users = users.set(id, createRecord());
          }
        });
        return users;
      }),

    [additionalActionTypes.FETCH_BY_IDS_FULFILLED]: (state, { payload, meta: { ids } }) =>
      state.update('resources', users => {
        payload.forEach(user => {
          users = users.set(user.id, createRecord({ state: resourceStatus.FULFILLED, data: user }));
        });
        // in case some of the users were not returned in payload
        ids.forEach(id => {
          if (users.has(id) && users.getIn([id, 'data'], null) === null) {
            users = users.delete(id);
          }
        });
        return users;
      }),

    [additionalActionTypes.FETCH_BY_IDS_REJECTED]: (state, { meta: { ids } }) =>
      state.update('resources', users => {
        ids.forEach(id => {
          if (users.has(id) && users.getIn([id, 'data'], null) === null) {
            users = users.delete(id);
          }
        });
        return users;
      }),

    [emailVerificationActionTypes.EMAIL_VERIFICATION_FULFILLED]: (state, { meta: { userId } }) =>
      state.hasIn(['resources', userId])
        ? state.updateIn(['resources', userId, 'data'], userData =>
            userData === null ? null : userData.set('isVerified', true)
          )
        : state,

    [groupsActionTypes.JOIN_GROUP_PENDING]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'studentOf'], list =>
        list.push(groupId)
      );
    },

    [groupsActionTypes.JOIN_GROUP_REJECTED]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'studentOf'], list =>
        list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.LEAVE_GROUP_PENDING]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'studentOf'], list =>
        list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.LEAVE_GROUP_REJECTED]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'studentOf'], list =>
        list.push(groupId)
      );
    },

    [groupsActionTypes.MAKE_SUPERVISOR_PENDING]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'], list =>
        list.push(groupId)
      );
    },

    [sisSupervisedCoursesActionTypes.CREATE_FULFILLED]: (state, { meta: { userId }, payload }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'], list =>
        list.push(payload.id)
      );
    },

    [groupsActionTypes.MAKE_SUPERVISOR_REJECTED]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'], list =>
        list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.REMOVE_SUPERVISOR_PENDING]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'], list =>
        list.filter(id => id !== groupId)
      );
    },

    [groupsActionTypes.REMOVE_SUPERVISOR_REJECTED]: (state, { meta: { groupId, userId } }) => {
      if (!state.getIn(['resources', userId])) {
        return state;
      }

      return state.updateIn(['resources', userId, 'data', 'privateData', 'groups', 'supervisorOf'], list =>
        list.push(groupId)
      );
    },

    [additionalActionTypes.CREATE_LOCAL_LOGIN_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'privateData', 'isLocal'], true),

    [additionalActionTypes.CREATE_LOCAL_LOGIN_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'privateData', 'isLocal'], false),

    [additionalActionTypes.CREATE_LOCAL_LOGIN_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(['resources', id, 'data'], fromJS(payload)),

    // Pagination result needs to store entity data here whilst indices are stored in pagination module
    [paginationActionTypes.FETCH_PAGINATED_FULFILLED]: (state, { payload: { items }, meta: { endpoint } }) =>
      endpoint === 'users'
        ? state.mergeIn(
            ['resources'],
            arrayToObject(
              items,
              obj => obj.id,
              data =>
                createRecord({
                  data,
                  state: resourceStatus.FULFILLED,
                  didInvalidate: false,
                  lastUpdate: Date.now(),
                })
            )
          )
        : state,

    [exercisesAuthorsActionTypes.FETCH_FULFILLED]: (state, { payload }) =>
      state.mergeIn(
        ['resources'],
        arrayToObject(
          payload,
          obj => obj.id,
          data =>
            createRecord({
              data,
              state: resourceStatus.FULFILLED,
              didInvalidate: false,
              lastUpdate: Date.now(),
            })
        )
      ),

    [additionalActionTypes.SET_ROLE_FULFILLED]: (state, { payload: data }) =>
      data && data.id
        ? state.setIn(
            ['resources', data.id],
            createRecord({
              data,
              state: resourceStatus.FULFILLED,
              didInvalidate: false,
              lastUpdate: Date.now(),
            })
          )
        : state,

    [additionalActionTypes.SET_IS_ALLOWED_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'isAllowed-pending'], true),

    [additionalActionTypes.SET_IS_ALLOWED_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'isAllowed-pending'], false),

    [additionalActionTypes.SET_IS_ALLOWED_FULFILLED]: (state, { payload: data, meta: { id } }) =>
      data && data.id
        ? state.setIn(
            ['resources', data.id],
            createRecord({
              data,
              state: resourceStatus.FULFILLED,
              didInvalidate: false,
              lastUpdate: Date.now(),
            })
          )
        : state.setIn(['resources', id, 'data', 'isAllowed-pending'], false),

    [authActionTypes.LOGIN_FULFILLED]: (state, { payload: { user } }) =>
      user && user.id
        ? state.setIn(['resources', user.id], createRecord({ state: resourceStatus.FULFILLED, data: user }))
        : state,

    [registrationActionTypes.CREATE_ACCOUNT_FULFILLED]: (state, { payload: { user } }) =>
      user && user.id
        ? state.setIn(['resources', user.id], createRecord({ state: resourceStatus.FULFILLED, data: user }))
        : state,
  }),
  initialState
);

export default reducer;
