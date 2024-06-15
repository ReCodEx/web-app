import { createSelector, lruMemoize } from 'reselect';
import { getJsData } from '../helpers/resourceManager';

const getPielinesVariables = state => state.exercisePipelinesVariables;

export const getExercisePielinesVariables = lruMemoize(id =>
  createSelector(getPielinesVariables, variables => variables.get(id))
);

export const getExercisePielinesVariablesJS = lruMemoize(id =>
  createSelector(getPielinesVariables, variables => getJsData(variables.get(id)))
);
