import { createSelector } from 'reselect';

const getResources = state => state.sisPossibleParents.get('resources');

export const sisPossibleParentsSelector = courseId =>
  createSelector(getResources, resources => resources.get(courseId));
