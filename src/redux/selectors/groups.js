import { createSelector } from 'reselect';
import { List } from 'immutable';

import {
  studentOfGroupsIdsSelector,
  supervisorOfGroupsIdsSelector
} from './users';
import { getAssignments } from './assignments';
import { isReady, getId, getJsData } from '../helpers/resourceManager';

/**
 * Select groups part of the state
 */

export const groupsSelectors = state => state.groups.get('resources');
const filterGroups = (ids, groups) =>
  groups.filter(isReady).filter(group => ids.contains(getId(group)));

export const groupSelector = id =>
  createSelector(groupsSelectors, groups => groups.get(id));

export const studentOfSelector = userId =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), groupsSelectors],
    filterGroups
  );

export const supervisorOfSelector = userId =>
  createSelector(
    [supervisorOfGroupsIdsSelector(userId), groupsSelectors],
    filterGroups
  );

export const adminOfSelector = userId =>
  createSelector(groupsSelectors, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.admins.indexOf(userId) >= 0)
  );

const usersOfGroup = (type, groupId) =>
  createSelector(
    groupSelector(groupId),
    group => (group && isReady(group) ? group.getIn(['data', type]) : List())
  );

export const studentsOfGroup = groupId => usersOfGroup('students', groupId);
export const supervisorsOfGroup = groupId =>
  usersOfGroup('supervisors', groupId);
export const adminsOfGroup = groupId => usersOfGroup('admins', groupId);

export const groupsAssignmentsIdsSelector = (id, type = 'public') =>
  createSelector(
    groupSelector(id),
    group =>
      group && isReady(group)
        ? group.getIn(['data', 'assignments', type]) || List()
        : List()
  );

export const groupsAssignmentsSelector = (id, type = 'public') =>
  createSelector(
    [groupsAssignmentsIdsSelector(id, type), getAssignments],
    (groupsAssignmentsIds, assignments) =>
      groupsAssignmentsIds.map(id => assignments.getIn(['resources', id]))
  );

const getGroupParentIds = (id, groups) => {
  const group = groups.get(id);
  if (group && isReady(group)) {
    const data = group.get('data');
    return data.get('parentGroupId') !== null
      ? [data.get('id')].concat(
          getGroupParentIds(data.get('parentGroupId'), groups)
        )
      : [data.get('id')];
  } else {
    return [];
  }
};

export const allParentIdsForGroup = id =>
  createSelector(groupsSelectors, groups => getGroupParentIds(id, groups));
