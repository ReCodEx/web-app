import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseConfigs';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/config`
});

export const fetchExerciseConfig = actions.fetchResource;
export const fetchExerciseConfigIfNeeded = actions.fetchOneIfNeeded;
export const setExerciseConfig = actions.updateResource;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
