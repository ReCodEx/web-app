import { createSelector } from 'reselect';

const getReferenceSolutions = state => state.referenceSolutions;
const getResources = referenceSolutions => referenceSolutions.get('resources');

export const allReferenceSolutionsSelector = createSelector(
  getReferenceSolutions,
  getResources
);

export const getReferenceSolution = id =>
  createSelector(allReferenceSolutionsSelector, solutions => solutions.get(id));

export const referenceSolutionsSelector = exerciseId =>
  createSelector(allReferenceSolutionsSelector, referenceSolutions => {
    return referenceSolutions.filter(
      solution => solution.getIn(['data', 'exerciseId']) === exerciseId
    );
  });
