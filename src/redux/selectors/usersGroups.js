import { createSelector } from 'reselect';
import { List, Map } from 'immutable';

import { loggedInUserSelector } from './users';
import { groupsSelector, filterGroups } from './groups';
import { getAssignments } from './assignments';
import { isReady, getJsData } from '../helpers/resourceManager';

const EMPTY_MAP = Map();
const EMPTY_LIST = List();

// all the groups in the state
export const allGroups = state => state.groups;

// all the groups which
export const usersGroups = state => state.user.groups;

export default createSelector(
  [allGroups, usersGroups],
  // intersect all the groups with
  (groups, memberOf) =>
    groups.filter(group => memberOf.indexOf(group.id) !== -1)
);

export const loggedInStudentOfGroupsIdsSelector = createSelector(
  loggedInUserSelector,
  user =>
    user && isReady(user) ? user.getIn(['data', 'groups', 'studentOf']) : List()
);

export const loggedInSupervisorOfGroupsIdsSelector = createSelector(
  loggedInUserSelector,
  user =>
    user && isReady(user)
      ? user.getIn(['data', 'groups', 'supervisorOf'])
      : List()
);

export const loggedInStudentOfSelector = createSelector(
  [loggedInStudentOfGroupsIdsSelector, groupsSelector],
  filterGroups
);

export const loggedInSupervisorOfSelector = createSelector(
  [loggedInSupervisorOfGroupsIdsSelector, groupsSelector],
  filterGroups
);

export const loggedInStudentOfGroupsAssignmentsSelector = createSelector(
  [loggedInStudentOfSelector, groupsSelector, getAssignments],
  (studentOf, groups, assignments) =>
    studentOf
      ? studentOf.reduce((result, group) => {
          const groupAssignments =
            group && assignments && isReady(group)
              ? group
                  .getIn(['data', 'assignments', 'public'], EMPTY_LIST)
                  .map(assignmentId =>
                    assignments.getIn(['resources', assignmentId])
                  )
              : EMPTY_LIST;
          return result.set(group.getIn(['data', 'id']), groupAssignments);
        }, Map())
      : EMPTY_MAP
);
