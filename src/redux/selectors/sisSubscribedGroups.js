import { createSelector } from 'reselect';
import { Map } from 'immutable';

const getResources = state => state.sisSubscribedGroups.get('resources');

export const sisSubscribedGroupsSelector = (userId, year, term) =>
  createSelector(
    getResources,
    resources =>
      resources &&
      resources.get(userId) &&
      resources.getIn([userId, `${year}-${term}`])
        ? resources.getIn([userId, `${year}-${term}`])
        : Map()
  );
