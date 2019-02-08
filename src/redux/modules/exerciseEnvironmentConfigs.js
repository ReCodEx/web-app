import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseEnvironmentConfigs';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/environment-configs`,
});

export const fetchExerciseEnvironmentConfig = actions.fetchResource;
export const fetchExerciseEnvironmentConfigIfNeeded = actions.fetchOneIfNeeded;
export const setExerciseEnvironmentConfig = actions.updateResource;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
