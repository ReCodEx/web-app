import { createSelector } from 'reselect';

const getSolutionsFilesResources = state => state.solutionFiles.get('resources');
const getParam = (_, id) => id;

export const getSolutionFiles = createSelector([getSolutionsFilesResources, getParam], (solutionFiles, id) =>
  solutionFiles.get(id)
);
