import { createSelector } from 'reselect';

const getExerciseEnvironmentConfigs = state => state.exerciseEnvironmentConfigs;
const getResources = exerciseEnvironmentConfigs => exerciseEnvironmentConfigs.get('resources');

export const exerciseEnvironmentConfigsSelector = createSelector(
  getExerciseEnvironmentConfigs,
  getResources
);
export const exerciseEnvironmentConfigSelector = exerciseId =>
  createSelector(
    exerciseEnvironmentConfigsSelector,
    configs => configs.get(exerciseId)
  );
