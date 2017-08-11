import { createSelector } from 'reselect';
import { Map } from 'immutable';

const getResources = state => state.sisSupervisedCourses.get('resources');

export const sisSupervisedCoursesSelector = (userId, year, term) =>
  createSelector(
    getResources,
    resources =>
      resources &&
      resources.get(userId) &&
      resources.getIn([userId, `${year}-${term}`])
        ? resources.getIn([userId, `${year}-${term}`])
        : Map()
  );
