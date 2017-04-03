import { createSelector } from 'reselect';

const getReferenceSolutions = state => state.referenceSolutions;
const getResources = referenceSolutions => referenceSolutions.get('resources');

export const allReferenceSolutionsSelector = createSelector(getReferenceSolutions, getResources);
export const referenceSolutionsSelector = exerciseId =>
  createSelector(
    allReferenceSolutionsSelector,
    referenceSolutions => referenceSolutions.get(exerciseId)
  );
