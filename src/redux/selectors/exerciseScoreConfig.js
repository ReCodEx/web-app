import { createSelector } from 'reselect';

const getParam = (state, id) => id;

const getExerciseScoreConfig = state => state.exerciseScoreConfig;
const getResources = exerciseScoreConfig => exerciseScoreConfig.get('resources');

export const exerciseScoreConfigsSelector = createSelector(getExerciseScoreConfig, getResources);

export const exerciseScoreConfigSelector = createSelector(
  [exerciseScoreConfigsSelector, getParam],
  (configs, exerciseId) => configs.get(exerciseId)
);
