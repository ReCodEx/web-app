import { createSelector } from 'reselect';

const getExerciseScoreConfig = state => state.exerciseScoreConfig;
const getResources = exerciseScoreConfig =>
  exerciseScoreConfig.get('resources');

export const exerciseScoreConfigsSelector = createSelector(
  getExerciseScoreConfig,
  getResources
);
export const exerciseScoreConfigSelector = exerciseId =>
  createSelector(exerciseScoreConfigsSelector, configs =>
    configs.get(exerciseId)
  );
