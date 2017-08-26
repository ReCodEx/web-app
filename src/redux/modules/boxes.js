import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'boxes';
const { actions, reduceActions } = factory({
  resourceName,
  idFieldName: 'name',
  apiEndpointFactory: (name = '') => `/pipelines/boxes/${name}`
});

export const fetchBoxTypes = actions.fetchMany;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
