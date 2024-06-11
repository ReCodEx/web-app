import { createSelector } from 'reselect';

const getParam = (_, id) => id;

const getReferenceSolutions = state => state.referenceSolutions;
const getResources = referenceSolutions => referenceSolutions.get('resources');

export const allReferenceSolutionsSelector = createSelector(getReferenceSolutions, getResources);

export const getReferenceSolution = createSelector([allReferenceSolutionsSelector, getParam], (solutions, id) =>
  solutions.get(id)
);

export const referenceSolutionsSelector = exerciseId =>
  createSelector(allReferenceSolutionsSelector, referenceSolutions => {
    return referenceSolutions.filter(solution => solution.getIn(['data', 'exerciseId']) === exerciseId);
  });

export const getReferenceSolutionSetVisibilityStatus = createSelector(
  [allReferenceSolutionsSelector, getParam],
  (solutions, solutionId) => solutions && solutions.getIn([solutionId, 'visibility'], null)
);
