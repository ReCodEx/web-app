import { createSelector, defaultMemoize } from 'reselect';
import { getJsData } from '../helpers/resourceManager';

const getPielinesVariables = state => state.exercisePipelinesVariables;

export const getExercisePielinesVariables = defaultMemoize(id =>
  createSelector(
    getPielinesVariables,
    variables => variables.get(id)
  )
);

export const getExercisePielinesVariablesJS = defaultMemoize(id =>
  createSelector(
    getPielinesVariables,
    variables => getJsData(variables.get(id))
  )
);
