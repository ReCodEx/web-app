import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'environmentReferenceSolutionEvaluations';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/reference-solutions/${id}/evaluations`
});

export const fetchEnvironmentReferenceEvaluations = actions.fetchResource;
export const fetchEnvironmentReferenceEvaluationsIfNeeded =
  actions.fetchIfNeeded;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
