import { createSelector } from 'reselect';

const getExerciseConfigs = state => state.exerciseConfigs;
const getResources = exerciseConfigs => exerciseConfigs.get('resources');

export const exerciseConfigsSelector = createSelector(
  getExerciseConfigs,
  getResources
);
export const exerciseConfigSelector = exerciseId =>
  createSelector(exerciseConfigsSelector, configs => configs.get(exerciseId));
