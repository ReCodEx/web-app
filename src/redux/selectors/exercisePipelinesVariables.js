import { createSelector, lruMemoize } from 'reselect';
import { getJsData } from '../helpers/resourceManager';

const getPipelinesVariables = state => state.exercisePipelinesVariables;

export const getExercisePipelinesVariables = lruMemoize(id =>
  createSelector(getPipelinesVariables, variables => variables.get(id))
);

export const getExercisePipelinesVariablesJS = lruMemoize(id =>
  createSelector(getPipelinesVariables, variables => getJsData(variables.get(id)))
);
