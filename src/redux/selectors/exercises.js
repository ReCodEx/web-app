import { createSelector } from 'reselect';

const getExercises = state => state.exercises;
const getResources = exercises => exercises.get('resources');

export const exercisesSelector = createSelector(getExercises, getResources);
export const exerciseSelector = exerciseId =>
  createSelector(
    exercisesSelector,
    exercises => exercises.find(exercise => exercise.getIn(['data', 'id']) === exerciseId)
  );

export const getExercise = (id) =>
  createSelector(
    getExercises,
    exercises => exercises.getIn([ 'resources', id, ])
  );
