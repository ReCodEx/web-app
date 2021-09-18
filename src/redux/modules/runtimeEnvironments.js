import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'runtimeEnvironments';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const fetchRuntimeEnvironmentsEndpoint = '/runtime-environments';

export const fetchRuntimeEnvironments = () =>
  actions.fetchMany({
    endpoint: fetchRuntimeEnvironmentsEndpoint,
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
