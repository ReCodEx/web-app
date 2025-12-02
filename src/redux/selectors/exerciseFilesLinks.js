import { createSelector } from 'reselect';

const resourcesSelector = state => state.exerciseFilesLinks.get('resources');
const getParam = (_, id) => id;

export const getExerciseFilesLinks = createSelector([resourcesSelector, getParam], (links, exerciseId) =>
  links.get(exerciseId)
);

export const getExerciseFilesLinksOperation = createSelector([resourcesSelector, getParam], (links, exerciseId) =>
  links.getIn([exerciseId, 'operation'])
);
