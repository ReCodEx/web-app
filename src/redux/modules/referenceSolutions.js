import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'referenceSolutions';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (exerciseId) => `/reference-solutions/${exerciseId}`
});

/**
 * Actions
 */

export const fetchReferenceSolutions = actions.fetchResource;
export const fetchReferenceSolutionsIfNeeded = actions.fetchOneIfNeeded; // fetch solutions for one exercise

export const evaluateReferenceSolution = (exerciseId, solutionId, hwGroup) =>
  createApiAction({
    type: 'SUBMIT_REFERENCE_SOLUTION',
    endpoint: `/reference-solutions/${exerciseId}/evaluate/${solutionId}`,
    method: 'POST',
    meta: { exerciseId, solutionId },
    body: { hwGroup }
  });


/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;
