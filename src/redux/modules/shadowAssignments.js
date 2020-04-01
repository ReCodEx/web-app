import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'shadowAssignments';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: (id = '') => `/shadow-assignments/${id}`,
});

export { actionTypes };

export const additionalActionTypes = {
  VALIDATE: 'recovid/shadow-assignments/VALIDATE',
  CREATE_POINTS: 'recovid/shadow-assignments/CREATE_POINTS',
  CREATE_POINTS_PENDING: 'recovid/shadow-assignments/CREATE_POINTS_PENDING',
  CREATE_POINTS_FULFILLED: 'recovid/shadow-assignments/CREATE_POINTS_FULFILLED',
  CREATE_POINTS_REJECTED: 'recovid/shadow-assignments/CREATE_POINTS_REJECTED',
  UPDATE_POINTS: 'recovid/shadow-assignments/UPDATE_POINTS',
  UPDATE_POINTS_PENDING: 'recovid/shadow-assignments/UPDATE_POINTS_PENDING',
  UPDATE_POINTS_FULFILLED: 'recovid/shadow-assignments/UPDATE_POINTS_FULFILLED',
  UPDATE_POINTS_REJECTED: 'recovid/shadow-assignments/UPDATE_POINTS_REJECTED',
  REMOVE_POINTS: 'recovid/shadow-assignments/REMOVE_POINTS',
  REMOVE_POINTS_PENDING: 'recovid/shadow-assignments/REMOVE_POINTS_PENDING',
  REMOVE_POINTS_FULFILLED: 'recovid/shadow-assignments/REMOVE_POINTS_FULFILLED',
  REMOVE_POINTS_REJECTED: 'recovid/shadow-assignments/REMOVE_POINTS_REJECTED',
};

/**
 * Actions
 */

export const loadShadowAssignment = actions.pushResource;
export const fetchShadowAssignment = actions.fetchResource;
export const fetchShadowAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchShadowAssignmentsForGroup = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/shadow-assignments`,
  });

export const createShadowAssignment = groupId => actions.addResource({ groupId });
export const editShadowAssignment = actions.updateResource;
export const deleteShadowAssignment = actions.removeResource;

export const validateShadowAssignment = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE,
    endpoint: `/shadow-assignments/${id}/validate`,
    method: 'POST',
    body: { version },
  });

export const setShadowAssignmentPoints = (
  groupId,
  shadowAssignmentId,
  userId, // awardee ID
  pointsId = null,
  points,
  note = '',
  awardedAt = Math.floor(Date.now() / 1000)
) =>
  pointsId === null
    ? createApiAction({
        type: additionalActionTypes.CREATE_POINTS,
        method: 'POST',
        endpoint: `/shadow-assignments/${shadowAssignmentId}/create-points`,
        meta: { groupId, shadowAssignmentId, points, userId },
        body: { userId, points, note, awardedAt },
      })
    : createApiAction({
        type: additionalActionTypes.UPDATE_POINTS,
        method: 'POST',
        endpoint: `/shadow-assignments/points/${pointsId}`,
        meta: { groupId, shadowAssignmentId, pointsId, points, userId },
        body: { points, note, awardedAt },
      });

export const removeShadowAssignmentPoints = (
  groupId,
  shadowAssignmentId,
  userId, // awardee ID
  pointsId
) =>
  createApiAction({
    type: additionalActionTypes.REMOVE_POINTS,
    method: 'DELETE',
    endpoint: `/shadow-assignments/points/${pointsId}`,
    meta: { groupId, shadowAssignmentId, pointsId, userId, points: null },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.CREATE_POINTS_FULFILLED]: (state, { payload, meta: { shadowAssignmentId } }) =>
      state.updateIn(['resources', shadowAssignmentId, 'data', 'points'], points => points.push(fromJS(payload))),

    [additionalActionTypes.UPDATE_POINTS_FULFILLED]: (state, { payload, meta: { shadowAssignmentId, pointsId } }) =>
      state.updateIn(['resources', shadowAssignmentId, 'data', 'points'], points =>
        points.filter(p => p.get('id') !== pointsId).push(fromJS(payload))
      ),

    [additionalActionTypes.REMOVE_POINTS_FULFILLED]: (state, { meta: { shadowAssignmentId, pointsId } }) =>
      state.updateIn(['resources', shadowAssignmentId, 'data', 'points'], points =>
        points.filter(p => p.get('id') !== pointsId)
      ),
  }),
  initialState
);

export default reducer;
