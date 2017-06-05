import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'referenceSolutionEvaluations';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/reference-solutions/${id}/evaluations`
});

export const fetchReferenceEvaluations = actions.fetchResource;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
