import { createSelector } from 'reselect';
import { EMPTY_ARRAY } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/exercises';

const getParam = (state, id) => id;

const getExercises = state => state.exercises;
const getResources = exercises => exercises.get('resources');
const getGroupExercises = state => state.groupExercises;

export const exercisesSelector = createSelector(getExercises, getResources);
export const exerciseSelector = exerciseId =>
  createSelector(exercisesSelector, exercises => exercises.get(exerciseId));

export const fetchManyStatus = createSelector(getExercises, state =>
  state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const getExercise = id =>
  createSelector(getExercises, exercises => exercises.getIn(['resources', id]));

export const getExerciseRuntimeEnvironments = id =>
  createSelector(
    getExercise(id),
    exercise => exercise && exercise.getIn(['data', 'runtimeEnvironments'])
  );

export const getFork = (id, forkId) =>
  createSelector(getExercise(id), exercise =>
    exercise.getIn(['data', 'forks', forkId])
  );

export const getExercisesByIdsSelector = ids =>
  createSelector(exercisesSelector, exercises =>
    exercises
      .filter(isReady)
      .filter(exercise => ids.indexOf(exercise.getIn(['data', 'id'])) >= 0)
  );

export const getExercisesForGroup = createSelector(
  [exercisesSelector, getGroupExercises, getParam],
  (exercises, groupExercises, groupId) => {
    const groupExIds = groupExercises[groupId]
      ? groupExercises[groupId]
      : EMPTY_ARRAY;
    return exercises
      .filter(isReady)
      .filter(
        exercise => groupExIds.indexOf(exercise.getIn(['data', 'id'])) >= 0
      );
  }
);
