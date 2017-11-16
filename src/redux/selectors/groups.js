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

export const groupsSelector = state => state.groups.get('resources');
export const filterGroups = (ids, groups) =>
  groups.filter(isReady).filter(group => ids.contains(getId(group)));

export const groupSelector = id =>
  createSelector(groupsSelector, groups => groups.get(id));

export const studentOfSelector = userId =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), groupsSelector],
    filterGroups
  );

export const supervisorOfSelector = userId =>
  createSelector(
    [supervisorOfGroupsIdsSelector(userId), groupsSelector],
    filterGroups
  );

export const studentOfSelector2 = userId =>
  createSelector(groupsSelector, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.students.indexOf(userId) >= 0)
  );

export const supervisorOfSelector2 = userId =>
  createSelector(groupsSelector, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.supervisors.indexOf(userId) >= 0)
  );

export const adminOfSelector = userId =>
  createSelector(groupsSelector, groups =>
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
  createSelector(groupsSelector, groups => getGroupParentIds(id, groups));
