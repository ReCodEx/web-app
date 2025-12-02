import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware.js';
import factory, {
  createRecord,
  initialState,
  createActionsWithPostfixes,
  resourceStatus,
} from '../helpers/resourceManager';
import { arrayToObject } from '../../helpers/common.js';

const resourceName = 'exerciseFileLinks';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/file-links`,
});

/**
 * Actions
 */

export { actionTypes };

export const additionalActionTypes = {
  ...createActionsWithPostfixes('CREATE_FILE_LINK', 'recodex/exerciseFileLinks'),
  ...createActionsWithPostfixes('UPDATE_FILE_LINK', 'recodex/exerciseFileLinks'),
  ...createActionsWithPostfixes('REMOVE_FILE_LINK', 'recodex/exerciseFileLinks'),
};

export const fetchExerciseFileLinks = actions.fetchResource;
export const fetchExerciseFileLinksIfNeeded = actions.fetchOneIfNeeded;

export const addExerciseFileLink = (exerciseId, body) =>
  createApiAction({
    type: actionTypes.CREATE_FILE_LINK,
    endpoint: `/exercises/${exerciseId}/file-links`,
    method: 'POST',
    body,
    meta: { exerciseId },
  });

export const updateExerciseFileLink = (exerciseId, linkId, body) =>
  createApiAction({
    type: actionTypes.UPDATE_FILE_LINK,
    endpoint: `/exercises/${exerciseId}/file-links/${linkId}`,
    method: 'POST',
    body,
    meta: { exerciseId, linkId },
  });

export const removeExerciseFileLink = (exerciseId, linkId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE_LINK,
    endpoint: `/exercises/${exerciseId}/file-links/${linkId}`,
    method: 'DELETE',
    meta: { exerciseId, linkId },
  });

/**
 * Reducer
 */
const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data: arrayToObject(payload) })),

    // new file link creation
    [additionalActionTypes.CREATE_FILE_LINK_PENDING]: (state, { meta: { exerciseId } }) =>
      state
        .setIn(['resources', exerciseId, 'operation'], fromJS({ type: 'create', state: resourceStatus.PENDING }))
        .deleteIn(['resources', exerciseId, 'error']),

    [additionalActionTypes.CREATE_FILE_LINK_REJECTED]: (state, { meta: { exerciseId }, payload: error }) =>
      state
        .setIn(['resources', exerciseId, 'operation', 'state'], resourceStatus.FAILED)
        .setIn(['resources', exerciseId, 'operation', 'error'], fromJS(error)),

    [additionalActionTypes.CREATE_FILE_LINK_FULFILLED]: (state, { meta: { exerciseId }, payload }) =>
      state
        .deleteIn(['resources', exerciseId, 'operation'])
        .setIn(['resources', exerciseId, 'data', payload.id], fromJS(payload)),

    // file link update
    [additionalActionTypes.UPDATE_FILE_LINK_PENDING]: (state, { meta: { exerciseId, linkId } }) =>
      state.setIn(
        ['resources', exerciseId, 'operation'],
        fromJS({ type: 'update', linkId, state: resourceStatus.PENDING })
      ),

    [additionalActionTypes.UPDATE_FILE_LINK_REJECTED]: (state, { meta: { exerciseId }, payload: error }) =>
      state
        .setIn(['resources', exerciseId, 'operation', 'state'], resourceStatus.FAILED)
        .setIn(['resources', exerciseId, 'operation', 'error'], fromJS(error)),

    [additionalActionTypes.UPDATE_FILE_LINK_FULFILLED]: (state, { meta: { exerciseId, linkId }, payload }) =>
      state
        .deleteIn(['resources', exerciseId, 'operation'])
        .setIn(['resources', exerciseId, 'data', linkId], fromJS(payload)),

    // file link removal
    [actionTypes.REMOVE_FILE_LINK_PENDING]: (state, { meta: { exerciseId, linkId } }) =>
      state.setIn(
        ['resources', exerciseId, 'operation'],
        fromJS({ type: 'remove', linkId, state: resourceStatus.PENDING })
      ),

    [actionTypes.REMOVE_FILE_LINK_REJECTED]: (state, { meta: { exerciseId }, payload: error }) =>
      state
        .setIn(['resources', exerciseId, 'operation', 'state'], resourceStatus.FAILED)
        .setIn(['resources', exerciseId, 'operation', 'error'], fromJS(error)),

    [actionTypes.REMOVE_FILE_LINK_FULFILLED]: (state, { meta: { exerciseId, linkId } }) =>
      state.deleteIn(['resources', exerciseId, 'operation']).deleteIn(['resources', exerciseId, 'data', linkId]),
  }),
  initialState
);

export default reducer;
