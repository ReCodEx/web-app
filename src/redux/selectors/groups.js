import { createSelector } from 'reselect';
import { List } from 'immutable';

import { studentOfGroupsIdsSelector, supervisorOfGroupsIdsSelector } from './users';
import { getAssignments } from './assignments';
import { isReady, getId } from '../helpers/resourceManager';

/**
 * Select groups part of the state
 */

export const groupsSelectors = state => state.groups.get('resources');
const filterGroups = (ids, groups) => groups.filter(isReady).filter(group => ids.contains(getId(group)));

export const studentOfSelector = userId =>
  createSelector(
    [ studentOfGroupsIdsSelector(userId), groupsSelectors ],
    filterGroups
  );

export const supervisorOfSelector = userId =>
  createSelector(
    [ supervisorOfGroupsIdsSelector(userId), groupsSelectors ],
    filterGroups
  );

const usersOfGroup = (type, groupId) =>
  createSelector(
    groupSelector(groupId),
    group => group && isReady(group) ? group.getIn(['data', type]) : List()
  );

export const studentsOfGroup = groupId => usersOfGroup('students', groupId);
export const supervisorsOfGroup = groupId => usersOfGroup('supervisors', groupId);

export const groupSelector = id =>
  createSelector(
    groupsSelectors,
    groups => groups.get(id)
  );

export const groupsAssignmentsIdsSelector = id =>
  createSelector(
    groupSelector(id),
    group => group && isReady(group) ? group.getIn(['data', 'assignments']) : List()
  );

export const groupsAssignmentsSelector = id =>
  createSelector(
    [ groupsAssignmentsIdsSelector(id), getAssignments ],
    (groupsAssignmentsIds, assignments) =>
      groupsAssignmentsIds.map(id => assignments.getIn(['resources', id]))
  );
