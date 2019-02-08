import { createSelector } from 'reselect';

const getExerciseConfigs = state => state.exerciseConfigs;
const getResources = exerciseConfigs => exerciseConfigs.get('resources');

export const exerciseConfigsSelector = createSelector(
  getExerciseConfigs,
  getResources
);
export const exerciseConfigSelector = exerciseId =>
  createSelector(
    exerciseConfigsSelector,
    configs => configs.get(exerciseId)
  );

export const exerciseConfigFormErrors = (state, formName) =>
  (state.form[formName] &&
    state.form[formName].syncErrors &&
    state.form[formName].syncErrors.config) ||
  null;
