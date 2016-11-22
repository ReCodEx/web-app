import { handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'exercises';
const {
  actions,
  actionTypes,
  reduceActions
} = factory({ resourceName });

export const additionalActionTypes = {
  CREATE_EXERCISE: 'recodex/exercises/CREATE_EXERCISE',
  CREATE_EXERCISE_PENDING: 'recodex/exercises/CREATE_EXERCISE_PENDING',
  CREATE_EXERCISE_FAILED: 'recodex/exercises/CREATE_EXERCISE_FAILED',
  CREATE_EXERCISE_FULFILLED: 'recodex/exercises/CREATE_EXERCISE_FULFILLED',
  UPDATE_EXERCISE: 'recodex/exercises/UPDATE_EXERCISE',
  UPDATE_EXERCISE_PENDING: 'recodex/exercises/UPDATE_EXERCISE_PENDING',
  UPDATE_EXERCISE_FAILED: 'recodex/exercises/UPDATE_EXERCISE_FAILED',
  UPDATE_EXERCISE_FULFILLED: 'recodex/exercises/UPDATE_EXERCISE_FULFILLED'
};

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

export const create = () =>
  createApiAction({
    type: additionalActionTypes.CREATE_EXERCISE,
    endpoint: '/exercises',
    method: 'POST'
  });

export const editExercise = (exerciseId, body) =>
  createApiAction({
    type: additionalActionTypes.UPDATE_EXERCISE,
    endpoint: `/exercises/${exerciseId}`,
    method: 'POST',
    meta: { id: exerciseId, payload: body },
    body
  });

export const editRuntimeConfigs = (exerciseId, body) =>
  createApiAction({
    type: additionalActionTypes.UPDATE_EXERCISE,
    endpoint: `/exercises/${exerciseId}/runtime-configs`,
    method: 'POST',
    meta: { id: exerciseId, payload: body },
    body
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [additionalActionTypes.CREATE_EXERCISE_PENDING]: (state) => state,
  [additionalActionTypes.CREATE_EXERCISE_FAILED]: (state) => state,
  [additionalActionTypes.CREATE_EXERCISE_FULFILLED]: reduceActions[actionTypes.FETCH_FULFILLED],
  [additionalActionTypes.UPDATE_EXERCISE_FULFILLED]: reduceActions[actionTypes.FETCH_FULFILLED]

}), initialState);

export default reducer;
