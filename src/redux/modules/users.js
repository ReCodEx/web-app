import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import factory, {
  initialState,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as emailVerificationActionTypes } from './emailVerification';
import { actionTypes as paginationActionTypes } from './pagination';
import { actionTypes as exercisesAuthorsActionTypes } from './exercisesAuthors';
import { actionTypes as registrationActionTypes } from './registration';
import { actionTypes as authActionTypes } from './authTypes';
import { additionalActionTypes as groupActionTypes } from './groups';

import { arrayToObject } from '../../helpers/common';

export const additionalActionTypes = {
  // createActionsWithPostfixes generates all 4 constants for async operations
  ...createActionsWithPostfixes('VALIDATE_REGISTRATION_DATA', 'recodex/users'),
  ...createActionsWithPostfixes('FETCH_BY_IDS', 'recodex/users'),
  ...createActionsWithPostfixes('CREATE_LOCAL_LOGIN', 'recodex/users'),
  ...createActionsWithPostfixes('SET_ROLE', 'recodex/users'),
  ...createActionsWithPostfixes('SET_IS_ALLOWED', 'recodex/users'),
  ...createActionsWithPostfixes('INVITE_USER', 'recodex/users'),
  ...createActionsWithPostfixes('ACCEPT_INVITATION', 'recodex/users'),
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
export const validateRegistrationData = (email, password = null) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_REGISTRATION_DATA,
    endpoint: '/users/validate-registration-data',
    method: 'POST',
    body: password === null ? { email } : { email, password },
  });

export const updateProfile = actions.updateResource;
export const updateSettings = (id, body) => actions.updateResource(id, body, `/users/${id}/settings`);
export const updateUIData = (id, uiData, overwrite = false) =>
  actions.updateResource(id, { uiData, overwrite }, `/users/${id}/ui-data`);
export const deleteUser = actions.removeResource;

// we need the async dispatch here so we can return a resolved promise for an empty array
export const fetchByIds = ids => (dispatch, _) =>
  ids && ids.length > 0
    ? dispatch(
        createApiAction({
          type: additionalActionTypes.FETCH_BY_IDS,
          endpoint: '/users/list',
          method: 'POST',
          meta: { ids },
          body: { ids },
        })
      )
    : Promise.resolve({ value: [] }); // optimization, no ids => no actual call

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

export const inviteUser = body =>
  createApiAction({
    type: additionalActionTypes.INVITE_USER,
    endpoint: '/users/invite',
    method: 'POST',
    body,
  });

export const acceptInvitation = (password, token) =>
  createApiAction({
    type: authActionTypes.LOGIN,
    endpoint: '/users/accept-invitation',
    method: 'POST',
    body: { token, password, passwordConfirm: password },
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

    [groupActionTypes.LOCK_STUDENT_EXAM_FULFILLED]: (state, { payload: { user } }) =>
      state.setIn(['resources', user.id], createRecord({ state: resourceStatus.FULFILLED, data: user })),

    [groupActionTypes.UNLOCK_STUDENT_EXAM_FULFILLED]: (state, { payload }) =>
      state.setIn(['resources', payload.id], createRecord({ state: resourceStatus.FULFILLED, data: payload })),
  }),
  initialState
);

export default reducer;
