import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: exerciseId => `/exercises/${exerciseId}/pipelines`
});

/**
 * Actions
 */

export const fetchPipelines = actions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions), initialState);

export default reducer;
