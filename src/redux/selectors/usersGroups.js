import { createSelector } from 'reselect';
import { Map } from 'immutable';

import { EMPTY_MAP, EMPTY_LIST } from '../../helpers/common';
import { loggedInUserSelector, isLoggedAsSuperAdmin } from './users';
import { groupsSelector, filterNonOrganizationalActiveGroups } from './groups';
import { loggedInUserIdSelector } from './auth';
import { getAssignments } from './assignments';
import { isReady, getId, getJsData } from '../helpers/resourceManager';

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

const filterGroups = (ids, groups) => groups.filter(isReady).filter(group => ids.contains(getId(group)));

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

const groupsUserCanEditSelector = createSelector(
  [loggedInUserIdSelector, groupsSelector, state => isLoggedAsSuperAdmin(state)],
  (userId, groups, isSuperAdmin) =>
    groups.filter(isReady).filter(group => {
      if (isSuperAdmin) {
        return true;
      }
      const groupData = getJsData(group);
      return (
        groupData.privateData &&
        (groupData.privateData.supervisors.indexOf(userId) >= 0 || groupData.privateData.admins.indexOf(userId) >= 0)
      );
    })
);

export const groupsUserCanAssignToSelector = createSelector(
  groupsUserCanEditSelector,
  filterNonOrganizationalActiveGroups
);
