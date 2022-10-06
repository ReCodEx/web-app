import { handleActions, createAction } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submission';
import { actionTypes as submissionEvaluationActionTypes } from './submissionEvaluations';
import { getAssignmentSolversLastUpdate } from '../selectors/solutions';
import { objectFilter } from '../../helpers/common';

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
export const additionalActionTypes = {};

export const fetchSolutionReview = actions.fetchResource;
export const fetchSolutionReviewIfNeeded = actions.fetchOneIfNeeded;
export const deleteSolutionReview = actions.removeResource;

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { meta: { id }, payload: { reviewComments: data } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data })),
  }),
  initialState
);

export default reducer;
