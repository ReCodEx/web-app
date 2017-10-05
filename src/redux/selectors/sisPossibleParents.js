import { createSelector } from 'reselect';
import { Map } from 'immutable';

const getResources = state => state.sisPossibleParents.get('resources');

export const sisPossibleParentsSelector = courseId =>
  createSelector(
    getResources,
    resources =>
      resources && resources.get(courseId) ? resources.get(courseId) : Map()
  );
