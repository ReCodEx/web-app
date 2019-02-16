import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'sisTerms';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/extensions/sis/terms/${id}`,
});

export const fetchManyEndpoint = '/extensions/sis/terms';

export const fetchAllTerms = actions.fetchMany({
  endpoint: fetchManyEndpoint,
});
export const fetchTermsIfNeeded = actions.fetchIfNeeded;
export const fetchTermIfNeeded = actions.fetchOneIfNeeded;
export const create = actions.addResource;
export const editTerm = actions.updateResource;
export const deleteTerm = actions.removeResource;

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
