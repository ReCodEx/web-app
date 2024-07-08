import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware.js';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
const resourceName = 'solutionReviews';

const apiEndpointFactory = id => `/assignment-solutions/${id}/review`;
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory,
});

/**
 * Actions
 */
export { actionTypes };
export const additionalActionTypes = {
  // createActionsWithPostfixes generates all 4 constants for async operations
  ...createActionsWithPostfixes('ADD_COMMENT', 'recodex/solutionReviews'),
  ...createActionsWithPostfixes('UPDATE_COMMENT', 'recodex/solutionReviews'),
  ...createActionsWithPostfixes('REMOVE_COMMENT', 'recodex/solutionReviews'),
  ...createActionsWithPostfixes('FETCH_OPEN_REVIEWS', 'recodex/solutionReviews'),
  REMOVE_PENDING_REVIEW: 'recodex/solutionReviews/REMOVE_PENDING_REVIEW',
};

export const fetchSolutionReview = actions.fetchResource;
export const fetchSolutionReviewIfNeeded = actions.fetchOneIfNeeded;
export const setSolutionReviewState = (id, close) => actions.updateResource(id, { close });
export const deleteSolutionReview = actions.removeResource;

export const addComment = (solutionId, comment) =>
  createApiAction({
    type: additionalActionTypes.ADD_COMMENT,
    endpoint: `/assignment-solutions/${solutionId}/review-comment`,
    method: 'POST',
    meta: { solutionId },
    body: comment,
  });

export const updateComment = (solutionId, { id, ...comment }) =>
  createApiAction({
    type: additionalActionTypes.UPDATE_COMMENT,
    endpoint: `/assignment-solutions/${solutionId}/review-comment/${id}`,
    method: 'POST',
    meta: { solutionId, id },
    body: comment,
  });

export const removeComment = (solutionId, id) =>
  createApiAction({
    type: additionalActionTypes.REMOVE_COMMENT,
    endpoint: `/assignment-solutions/${solutionId}/review-comment/${id}`,
    method: 'DELETE',
    meta: { solutionId, id },
  });

export const fetchPendingReviewsOfUser = userId =>
  createApiAction({
    type: additionalActionTypes.FETCH_OPEN_REVIEWS,
    endpoint: `/users/${userId}/pending-reviews`,
    method: 'GET',
    meta: { userId },
  });

export const removePendingReview = createAction(
  additionalActionTypes.REMOVE_PENDING_REVIEW,
  (userId, groupId, assignmentId, solutionId) => ({ userId, groupId, assignmentId, solutionId })
);

/**
 * Reducer
 */

const createOpenReviewsIndex = ({ solutions, assignments }) => {
  const agIndex = {};
  const res = {};
  assignments.forEach(assignment => {
    if (assignment.groupId) {
      res[assignment.groupId] = res[assignment.groupId] || {};
      res[assignment.groupId][assignment.id] = res[assignment.groupId][assignment.id] || [];
      agIndex[assignment.id] = assignment.groupId;
    }
  });

  solutions.forEach(solution => {
    const groupId = agIndex[solution.assignmentId];
    if (groupId) {
      res[groupId][solution.assignmentId].push(solution.id);
    }
  });

  return res;
};

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { meta: { id }, payload: { reviewComments: data } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [actionTypes.UPDATE_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'state'], resourceStatus.RELOADING),

    [actionTypes.UPDATE_FULFILLED]: (state, { meta: { id }, payload: { reviewComments: data } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [actionTypes.REMOVE_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'state'], resourceStatus.RELOADING),

    [actionTypes.REMOVE_FULFILLED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data: [] })),

    [additionalActionTypes.ADD_COMMENT_FULFILLED]: (state, { meta: { solutionId }, payload: comment }) =>
      state.updateIn(['resources', solutionId, 'data'], comments => comments.push(fromJS(comment))),

    [additionalActionTypes.UPDATE_COMMENT_FULFILLED]: (state, { meta: { solutionId, id }, payload: comment }) =>
      state.updateIn(['resources', solutionId, 'data'], comments =>
        comments.map(c => (c.get('id') === id ? fromJS(comment) : c))
      ),

    [additionalActionTypes.REMOVE_COMMENT_PENDING]: (state, { meta: { solutionId, id } }) =>
      state.updateIn(['resources', solutionId, 'data'], comments =>
        comments.map(c => (c.get('id') === id ? c.set('removing', true) : c))
      ),
    [additionalActionTypes.REMOVE_COMMENT_REJECTED]: (state, { meta: { solutionId, id } }) =>
      state.updateIn(['resources', solutionId, 'data'], comments =>
        comments.map(c => (c.get('id') === id ? c.set('removing', false) : c))
      ),
    [additionalActionTypes.REMOVE_COMMENT_FULFILLED]: (state, { meta: { solutionId, id } }) =>
      state.updateIn(['resources', solutionId, 'data'], comments => comments.filter(c => c.get('id') !== id)),

    [additionalActionTypes.FETCH_OPEN_REVIEWS_PENDING]: (state, { meta: { userId } }) =>
      state.setIn(['open-reviews', userId], resourceStatus.PENDING),

    [additionalActionTypes.FETCH_OPEN_REVIEWS_REJECTED]: (state, { meta: { userId } }) =>
      state.setIn(['open-reviews', userId], resourceStatus.FAILED),

    [additionalActionTypes.FETCH_OPEN_REVIEWS_FULFILLED]: (state, { meta: { userId }, payload }) =>
      state.setIn(['open-reviews', userId], fromJS(createOpenReviewsIndex(payload))),

    [additionalActionTypes.REMOVE_PENDING_REVIEW]: (
      state,
      { payload: { userId, groupId, assignmentId, solutionId } }
    ) =>
      state.updateIn(['open-reviews', userId, groupId, assignmentId], solutions =>
        solutions.filter(id => id !== solutionId)
      ),
  }),
  initialState
);

export default reducer;
