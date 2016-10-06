import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
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

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  // @todo: save searched exercises

}), initialState);

export default reducer;
