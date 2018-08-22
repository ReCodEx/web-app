import { createSelector, defaultMemoize } from 'reselect';

const getExerciseTests = state => state.exerciseTests;
const getResources = exerciseTests => exerciseTests.get('resources');

export const exercisesTestsSelector = createSelector(
  getExerciseTests,
  getResources
);
export const exerciseTestsSelector = defaultMemoize(exerciseId =>
  createSelector(exercisesTestsSelector, tests => tests.get(exerciseId))
);
