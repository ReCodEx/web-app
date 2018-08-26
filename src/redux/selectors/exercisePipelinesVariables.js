import { createSelector, defaultMemoize } from 'reselect';

const getPielinesVariables = state => state.exercisePipelinesVariables;

export const getExercisePielinesVariables = defaultMemoize(id =>
  createSelector(getPielinesVariables, variables => variables.get(id))
);
