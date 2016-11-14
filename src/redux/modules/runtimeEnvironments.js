import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'runtimeEnvironments';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const fetchRuntimeEnvironmentsIfNeeded = actions.fetchIfNeeded;
export const fetchRuntimeEnvironmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchRuntimeEnvironments = () =>
  actions.fetchMany({
    endpoint: '/runtime-environments'
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;
