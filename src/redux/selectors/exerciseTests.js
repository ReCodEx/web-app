import { createSelector, lruMemoize } from 'reselect';

const getExerciseTests = state => state.exerciseTests;
const getResources = exerciseTests => exerciseTests.get('resources');

export const exercisesTestsSelector = createSelector(getExerciseTests, getResources);
export const exerciseTestsSelector = lruMemoize(exerciseId =>
  createSelector(exercisesTestsSelector, tests => tests.get(exerciseId))
);
