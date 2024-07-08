import { createSelector } from 'reselect';

import { EMPTY_LIST, EMPTY_MAP, EMPTY_ARRAY, objectMap } from '../../helpers/common.js';
import { fetchAllGroupsEndpoint } from '../modules/groups.js';
import { getAssignments } from './assignments.js';
import { getShadowAssignments } from './shadowAssignments.js';
import { loggedInUserIdSelector } from './auth.js';
import { getLang } from './app.js';
import { isReady } from '../helpers/resourceManager';
import { getLocalizedResourceName } from '../../helpers/localizedData.js';

/**
 * Select groups part of the state
 */
const getParam = (_, id) => id;

const getGroups = state => state.groups;
export const groupsSelector = state => state.groups.get('resources');

export const notArchivedGroupsSelector = createSelector(groupsSelector, groups =>
  groups.filter(isReady).filter(group => group.getIn(['data', 'archived']) === false)
);

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

export const groupTypePendingChange = createSelector(
  [groupsSelector, getParam],
  (groups, id) => groups && groups.getIn([id, 'pending-group-type'], false)
);

export const groupPendingUserLock = createSelector(
  [groupsSelector, getParam],
  (groups, id) => groups && groups.getIn([id, 'pending-user-lock'], null)
);

export const groupPendingUserUnlock = createSelector(
  [groupsSelector, getParam],
  (groups, id) => groups && groups.getIn([id, 'pending-user-unlock'], null)
);

export const groupArchivedPendingChange = createSelector(
  [groupsSelector, getParam],
  (groups, id) => groups && groups.getIn([id, 'pending-archived'], false)
);

export const fetchManyGroupsStatus = createSelector(getGroups, state =>
  state.getIn(['fetchManyStatus', fetchAllGroupsEndpoint])
);

/**
 * Computes inverted group index for given user user.
 * @returns {Object} containing 'admin', 'supervisor', 'observer', and 'student' keys;
 *                   each key holds a list of grouIds to which the logged user belongs (given the membership type)
 */
const groupsUserIsMember = (groups, userId, lang) => {
  // get group names for sorting comparator
  const groupNames = {};
  groups.forEach(group => {
    groupNames[group.getIn(['data', 'id'])] = getLocalizedResourceName(group, lang);
  });

  const groupFullNames = {};
  groups.forEach(group => {
    const groupId = group.getIn(['data', 'id']);
    const names = group
      .getIn(['data', 'parentGroupsIds'])
      .toArray()
      .filter((_, idx) => idx > 0)
      .map(id => groupNames[id] || '');
    names.push(groupNames[groupId] || '');
    groupFullNames[groupId] = names.join('~/~');
  });

  // create sorting comparator
  const groupComparator = (a, b) => groupFullNames[a].localeCompare(groupFullNames[b], lang);

  // prepare categories of memberships
  const membershipDescriptor = {
    admin: ['primaryAdminsIds'],
    supervisor: ['privateData', 'supervisors'],
    observer: ['privateData', 'observers'],
    student: ['privateData', 'students'],
  };

  // traverse groups and filter out those the user is member of (categorized)
  const result = objectMap(membershipDescriptor, () => []); // all values are empty arrays
  const all = new Set();
  groups
    .map(group => group.get('data'))
    .filter(group => group.get('organizational') === false)
    .forEach(group => {
      Object.keys(membershipDescriptor).forEach(key => {
        const list = group.getIn(membershipDescriptor[key], EMPTY_LIST);
        if (list.includes(userId)) {
          result[key].push(group.get('id')); // user is present on membership list => add the group to result segment
          all.add(group.get('id'));
        }
      });
    });

  // finalize, sort
  result.all = Array.from(all);
  Object.keys(result).forEach(key => result[key].sort(groupComparator));
  return result;
};

export const groupsLoggedUserIsMemberSelector = createSelector(
  [notArchivedGroupsSelector, loggedInUserIdSelector, getLang],
  groupsUserIsMember
);

export const groupsUserIsMemberSelector = createSelector(
  [notArchivedGroupsSelector, getParam, getLang],
  groupsUserIsMember
);

/**
 * Helper selector-related function that extracts unique admin IDs form given groups
 * @param {Array} groups as JS objects
 * @returns {String[]} unique user IDs
 */
export const getGroupsAdmins = groups => {
  const ids = new Set(); // set ensures each id is represented once
  groups.forEach(group => group && group.primaryAdminsIds && group.primaryAdminsIds.forEach(id => ids.add(id)));
  return Array.from(ids);
};
