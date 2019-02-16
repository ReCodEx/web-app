import { createSelector } from 'reselect';
import { Map } from 'immutable';

import { EMPTY_MAP, EMPTY_LIST } from '../../helpers/common';
import { loggedInUserSelector } from './users';
import { groupsSelector, filterGroups, filterNonOrganizationalActiveGroups } from './groups';
import { getAssignments } from './assignments';
import { isReady } from '../helpers/resourceManager';

// all the groups in the state
export const allGroups = state => state.groups;

// all the groups which
export const usersGroups = state => state.user.groups;

export default createSelector(
  [allGroups, usersGroups],
  // intersect all the groups with
  (groups, memberOf) => groups.filter(group => memberOf.indexOf(group.id) !== -1)
);

export const loggedInStudentOfGroupsIdsSelector = createSelector(
  loggedInUserSelector,
  user => (user && isReady(user) ? user.getIn(['data', 'privateData', 'groups', 'studentOf']) : EMPTY_LIST)
);

export const loggedInSupervisorOfGroupsIdsSelector = createSelector(
  loggedInUserSelector,
  user => (user && isReady(user) ? user.getIn(['data', 'privateData', 'groups', 'supervisorOf']) : EMPTY_LIST)
);

export const loggedInStudentOfSelector = createSelector(
  [loggedInStudentOfGroupsIdsSelector, groupsSelector],
  filterGroups
);

export const loggedInSupervisorOfSelector = createSelector(
  [loggedInSupervisorOfGroupsIdsSelector, groupsSelector],
  filterGroups
);

export const loggedInSupervisorOfNonOrganizationalSelector = createSelector(
  loggedInSupervisorOfSelector,
  filterNonOrganizationalActiveGroups
);

export const loggedInStudentOfGroupsAssignmentsSelector = createSelector(
  [loggedInStudentOfSelector, groupsSelector, getAssignments],
  (studentOf, groups, assignments) =>
    studentOf
      ? studentOf.reduce((result, group) => {
          const groupAssignments =
            group && assignments && isReady(group)
              ? group
                  .getIn(['data', 'privateData', 'assignments'], EMPTY_LIST)
                  .map(assignmentId => assignments.getIn(['resources', assignmentId]))
              : EMPTY_LIST;
          return result.set(group.getIn(['data', 'id']), groupAssignments);
        }, Map())
      : EMPTY_MAP
);
