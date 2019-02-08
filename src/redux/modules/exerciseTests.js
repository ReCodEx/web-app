import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseTests';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/tests`,
});

export const fetchExerciseTests = actions.fetchResource;
export const fetchExerciseTestsIfNeeded = actions.fetchOneIfNeeded;
export const setExerciseTests = actions.updateResource;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
