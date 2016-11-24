import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'exercises';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const loadExercise = actions.pushResource;
export const fetchExercisesIfNeeded = actions.fetchIfNeeded;
export const fetchExerciseIfNeeded = actions.fetchOneIfNeeded;

export const fetchExercises = () =>
  actions.fetchMany({
    endpoint: '/exercises'
  });

export const create = actions.addResource;
export const editExercise = actions.updateResource;
export const editRuntimeConfigs = (id, body) => actions.updateResource(id, body, `/exercises/${id}/runtime-configs`);

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;
