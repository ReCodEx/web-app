import { createSelector } from 'reselect';
import { EMPTY_LIST, EMPTY_MAP, EMPTY_ARRAY } from '../../helpers/common';

import { fetchAllGroupsEndpoint } from '../modules/groups';
import { getAssignments } from './assignments';
import { getShadowAssignments } from './shadowAssignments';
import { isReady } from '../helpers/resourceManager';

/**
 * Select groups part of the state
 */
const getParam = (state, id) => id;

const getGroups = state => state.groups;
export const groupsSelector = state => state.groups.get('resources');

export const notArchivedGroupsSelector = state =>
  state.groups
    .get('resources')
    .filter(isReady)
    .filter(group => group.getIn(['data', 'archived']) === false);

export const groupSelector = createSelector([groupsSelector, getParam], (groups, id) => groups.get(id));

export const groupSelectorCreator = id => createSelector(groupsSelector, groups => groups.get(id));

// This is perhaps the best way how to create simple accessor (selector with parameter).
export const groupAccessorSelector = createSelector(groupsSelector, groups => groupId => groups.get(groupId));

// This is perhaps the best way how to create simple accessor (selector with parameter).
export const groupDataAccessorSelector = createSelector(
  groupsSelector,
  groups => groupId => groups.getIn([groupId, 'data'], EMPTY_MAP)
);

export const groupsAssignmentsSelector = createSelector(
  [groupsSelector, getAssignments, getParam],
  (groups, assignments, groupId) =>
    groups
      .getIn([groupId, 'data', 'privateData', 'assignments'], EMPTY_LIST)
      .map(id => assignments.getIn(['resources', id]))
);

export const groupsShadowAssignmentsSelector = createSelector(
  [groupsSelector, getShadowAssignments, getParam],
  (groups, shadowAssignments, groupId) =>
    groups
      .getIn([groupId, 'data', 'privateData', 'shadowAssignments'], EMPTY_LIST)
      .map(id => shadowAssignments.getIn(['resources', id]))
);

const getGroupParentIds = (id, groups) => {
  const group = groups.get(id);
  if (group && isReady(group)) {
    const data = group.get('data');
    return data.get('parentGroupId') !== null
      ? [data.get('id')].concat(getGroupParentIds(data.get('parentGroupId'), groups))
      : [data.get('id')];
  } else {
    return EMPTY_ARRAY;
  }
};

export const allParentIdsForGroup = id => createSelector(groupsSelector, groups => getGroupParentIds(id, groups));

export const canViewParentDetailSelector = createSelector([groupsSelector, getParam], (groups, id) => {
  const parentId = groups.getIn([id, 'data', 'parentGroupId']);
  return Boolean(parentId && groups.getIn([parentId, 'data', 'permissionHints', 'viewDetail']));
});

export const groupOrganizationalPendingChange = id =>
  createSelector(groupsSelector, groups => groups && groups.getIn([id, 'pending-organizational'], false));

export const groupArchivedPendingChange = id =>
  createSelector(groupsSelector, groups => groups && groups.getIn([id, 'pending-archived'], false));

export const fetchManyGroupsStatus = createSelector(getGroups, state =>
  state.getIn(['fetchManyStatus', fetchAllGroupsEndpoint])
);
