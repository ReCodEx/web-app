import { createSelector } from 'reselect';
import { Map } from 'immutable';

/**
 * Select groups part of the state
 */
const EMPTY_MAP = Map();

export const publicGroupsSelectors = state =>
  state.publicGroups.get('resources');

export const publicGroupSelector = id =>
  createSelector(publicGroupsSelectors, groups => groups.get(id));

export const publicGroupDataAccessorSelector = createSelector(
  publicGroupsSelectors,
  groups => groupId => groups.getIn([groupId, 'data'], EMPTY_MAP)
);
