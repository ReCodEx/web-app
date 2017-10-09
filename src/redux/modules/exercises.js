import { handleActions } from 'redux-actions';
import { Map } from 'immutable';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as supplementaryFilesActionTypes } from './supplementaryFiles';

import { actionTypes as additionalFilesActionTypes } from './additionalExerciseFiles';

const resourceName = 'exercises';
const { actions, reduceActions, actionTypes } = factory({ resourceName });

export { actionTypes };

/**
 * Actions
 */

export const additionalActionTypes = {
  VALIDATE_EXERCISE: 'recodex/exercises/VALIDATE_EXERCISE',
  FORK_EXERCISE: 'recodex/exercises/FORK_EXERCISE',
  FORK_EXERCISE_PENDING: 'recodex/exercises/FORK_EXERCISE_PENDING',
  FORK_EXERCISE_REJECTED: 'recodex/exercises/FORK_EXERCISE_REJECTED',
  FORK_EXERCISE_FULFILLED: 'recodex/exercises/FORK_EXERCISE_FULFILLED',
  GET_PIPELINE_VARIABLES: 'recodex/exercises/GET_PIPELINE_VARIABLES'
};

export const loadExercise = actions.pushResource;
export const fetchExercisesIfNeeded = actions.fetchIfNeeded;
export const fetchExercise = actions.fetchResource;
export const fetchExerciseIfNeeded = actions.fetchOneIfNeeded;

export const fetchExercises = () =>
  actions.fetchMany({
    endpoint: '/exercises'
  });

export const fetchGroupExercises = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/exercises`
  });

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED'
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
export const editRuntimeConfigs = (id, body) =>
  actions.updateResource(id, body, `/exercises/${id}/runtime-configs`);
export const deleteExercise = actions.removeResource;

export const validateExercise = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_EXERCISE,
    endpoint: `/exercises/${id}/validate`,
    method: 'POST',
    body: { version }
  });

export const getVariablesForPipelines = (
  exerciseId,
  runtimeEnvironmentId,
  pipelinesIds
) => {
  const body =
    runtimeEnvironmentId === 'default'
      ? { pipelinesIds }
      : { runtimeEnvironmentId, pipelinesIds };
  return createApiAction({
    type: additionalActionTypes.GET_PIPELINE_VARIABLES,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/config/variables`,
    meta: { exerciseId, runtimeEnvironmentId, pipelinesIds },
    body
  });
};

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.FORK_EXERCISE_PENDING]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.updateIn(['resources', id, 'data'], exercise => {
        if (!exercise.has('forks')) {
          exercise = exercise.set('forks', Map());
        }

        return exercise.update('forks', forks =>
          forks.set(forkId, { status: forkStatuses.PENDING })
        );
      }),

    [additionalActionTypes.FORK_EXERCISE_REJECTED]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.REJECTED
      }),

    [additionalActionTypes.FORK_EXERCISE_FULFILLED]: (
      state,
      { payload: { id: exerciseId }, meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.FULFILLED,
        exerciseId
      }),

    [supplementaryFilesActionTypes.ADD_FILES_FULFILLED]: (
      state,
      { payload: files, meta: { exerciseId } }
    ) =>
      state.hasIn(['resources', exerciseId])
        ? addFiles(state, exerciseId, files, 'supplementaryFilesIds')
        : state,

    [additionalFilesActionTypes.ADD_FILES_FULFILLED]: (
      state,
      { payload: files, meta: { exerciseId } }
    ) =>
      state.hasIn(['resources', exerciseId])
        ? addFiles(state, exerciseId, files, 'additionalExerciseFilesIds')
        : state
  }),
  initialState
);

const addFiles = (state, exerciseId, files, field) =>
  state.updateIn(['resources', exerciseId, 'data', field], list =>
    list.push(...files.map(file => file.id))
  );

export default reducer;
