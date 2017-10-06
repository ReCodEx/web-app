import { createSelector } from 'reselect';

/**
 * Select groups part of the state
 */

export const publicGroupsSelectors = state =>
  state.publicGroups.get('resources');

export const publicGroupSelector = id =>
  createSelector(publicGroupsSelectors, groups => groups.get(id));
