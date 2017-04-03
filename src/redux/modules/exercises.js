import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'exercises';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const additionalActionTypes = {
  VALIDATE_EXERCISE: 'VALIDATE_EXERCISE',
  FORK_EXERCISE: 'FORK_EXERCISE',
  FORK_EXERCISE_PENDING: 'FORK_EXERCISE_PENDING',
  FORK_EXERCISE_REJECTED: 'FORK_EXERCISE_REJECTED',
  FORK_EXERCISE_FULFILLED: 'FORK_EXERCISE_FULFILLED'
};

export const loadExercise = actions.pushResource;
export const fetchExercisesIfNeeded = actions.fetchIfNeeded;
export const fetchExercise = actions.fetchResource;
export const fetchExerciseIfNeeded = actions.fetchOneIfNeeded;

export const fetchExercises = () =>
  actions.fetchMany({
    endpoint: '/exercises'
  });

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULLFILLED'
};

export const forkExercise = (id, forkId) =>
  createApiAction({
    type: additionalActionTypes.FORK_EXERCISE,
    endpoint: `/exercises/${id}/fork`,
    method: 'POST',
    meta: { id, forkId }
  });

export const create = actions.addResource;
export const editExercise = actions.updateResource;
export const editRuntimeConfigs = (id, body) => actions.updateResource(id, body, `/exercises/${id}/runtime-configs`);
export const deleteExercise = actions.removeResource;

export const validateExercise = (id, version) =>
  createApiAction({
    type: 'VALIDATE_EXERCISE',
    endpoint: `/exercises/${id}/validate`,
    method: 'POST',
    body: { version }
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [additionalActionTypes.FORK_EXERCISE_PENDING]: (state, { meta: {id, forkId} }) =>
    state.updateIn(['resources', id, 'data'], exercise => {
      if (!exercise.has('forks')) {
        exercise = exercise.set('forks', new Map());
      }

      return exercise.update('forks', fork => fork.set(forkId, { status: forkStatuses.PENDING }));
    }),

  [additionalActionTypes.FORK_EXERCISE_REJECTED]: (state, { meta: {id, forkId} }) =>
    state.setIn([ 'resources', id, 'data', 'forks', forkId ], { status: forkStatuses.REJECTED }),

  [additionalActionTypes.FORK_EXERCISE_FULFILLED]: (state, { payload: {id: exerciseId}, meta: {id, forkId} }) =>
    state.setIn([ 'resources', id, 'data', 'forks', forkId ], { status: forkStatuses.FULFILLED, exerciseId })

}), initialState);

export default reducer;
