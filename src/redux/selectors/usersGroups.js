import { createSelector, defaultMemoize } from 'reselect';

import { EMPTY_MAP, EMPTY_LIST } from '../../helpers/common';
import { readyUsersDataSelector, isLoggedAsSuperAdmin } from './users';
import { groupsSelector, groupSelectorCreator } from './groups';
import { loggedInUserIdSelector } from './auth';
import { isReady, getJsData } from '../helpers/resourceManager';

const getState = state => state;
const getParam = (_, id) => id;

// users of type in particualar groups
const usersIdsOfGroup = (type, groupId) =>
  createSelector(groupSelectorCreator(groupId), group =>
    group && isReady(group) ? group.getIn(['data', 'privateData', type], EMPTY_LIST).toArray() : []
  );

export const studentsIdsOfGroup = groupId => usersIdsOfGroup('students', groupId);
export const supervisorsIdsOfGroup = groupId => usersIdsOfGroup('supervisors', groupId);
export const observersIdsOfGroup = groupId => usersIdsOfGroup('observers', groupId);
export const adminsIdsOfGroup = groupId => usersIdsOfGroup('admins', groupId);
export const primaryAdminsIdsOfGroup = groupId =>
  createSelector(groupSelectorCreator(groupId), group =>
    group && isReady(group) ? group.getIn(['data', 'primaryAdminsIds'], EMPTY_LIST) : EMPTY_LIST
  );

// specialized function that lists all group IDs the user is student of (handle with care, time demanding)
export const userStudentOfGroupIdsSelector = createSelector([groupsSelector, getParam], (groups, userId) =>
  groups
    .toArray()
    .filter(isReady)
    .map(getJsData)
    .filter(group => group.privateData && group.privateData.students && group.privateData.students.indexOf(userId) >= 0)
    .map(group => group.id)
);

export const isSupervisorOfSelector = defaultMemoize((state, userId, groupId) =>
  supervisorsIdsOfGroup(groupId)(state).includes(userId)
);

export const isStudentOfSelector = defaultMemoize((state, userId, groupId) =>
  studentsIdsOfGroup(groupId)(state).includes(userId)
);

export const primaryAdminsOfGroupSelector = createSelector(
  [readyUsersDataSelector, getParam, getState],
  (users, groupId, state) => {
    const adminsIds = primaryAdminsIdsOfGroup(groupId)(state);
    const adminsIndex = new Set(adminsIds);
    return users.filter(user => adminsIndex.has(user.id));
  }
);

export const supervisorsOfGroupSelector = createSelector(
  [readyUsersDataSelector, getParam, getState],
  (users, groupId, state) => {
    const supervisorsIds = supervisorsIdsOfGroup(groupId)(state);
    const supervisorsIndex = new Set(supervisorsIds);
    return users.filter(user => supervisorsIndex.has(user.id));
  }
);

export const observersOfGroupSelector = createSelector(
  [readyUsersDataSelector, getParam, getState],
  (users, groupId, state) => {
    const observersIds = observersIdsOfGroup(groupId)(state);
    const observersIndex = new Set(observersIds);
    return users.filter(user => observersIndex.has(user.id));
  }
);

export const studentsOfGroupSelector = createSelector(
  [readyUsersDataSelector, getParam, getState],
  (users, groupId, state) => {
    const studentIds = studentsIdsOfGroup(groupId)(state);
    const studentsIndex = new Set(studentIds);
    return users.filter(user => studentsIndex.has(user.id));
  }
);

// quite inefficient methods for filtering relevant groups (use carefully, maybe we will replace them in the future)
export const studentOfSelector = userId =>
  createSelector(groupsSelector, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.privateData && group.privateData.students.includes(userId))
  );

export const supervisorOfSelector = userId =>
  createSelector(groupsSelector, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.privateData && group.privateData.supervisors.includes(userId))
  );

export const adminOfSelector = userId =>
  createSelector(groupsSelector, groups =>
    groups
      .filter(isReady)
      .map(getJsData)
      .filter(group => group.privateData && group.privateData.admins.includes(userId))
  );

export const pendingMembershipsSelector = createSelector([groupsSelector, getParam], (groups, groupId) =>
  groups.getIn([groupId, 'pending-membership'], EMPTY_LIST)
);

/*
 * Optimized selectors for logged-in user
 */

const loggedUserMemberOfGroupsSelector = type =>
  createSelector([groupsSelector, loggedInUserIdSelector], (groups, userId) =>
    groups.filter(isReady).filter(group => group.getIn(['data', 'privateData', type], EMPTY_MAP).includes(userId))
  );

export const loggedUserStudentOfGroupsSelector = loggedUserMemberOfGroupsSelector('students');
export const loggedUserObserverOfGroupsSelector = loggedUserMemberOfGroupsSelector('observers');
export const loggedUserSupervisorOfGroupsSelector = loggedUserMemberOfGroupsSelector('supervisors');
export const loggedUserAdminOfGroupsSelector = loggedUserMemberOfGroupsSelector('admins');

// membership checking function of type for logged user (implemented separately to be more efficient)
const loggedUserIsMemberOfSelector = type =>
  createSelector(loggedUserMemberOfGroupsSelector(type), groups => {
    const lookupIndex = new Set(groups.toArray().map(group => group.getIn(['data', 'id'])));
    return groupId => lookupIndex.has(groupId);
  });

export const loggedUserIsStudentOfSelector = loggedUserIsMemberOfSelector('students');
export const loggedUserIsObserverOfSelector = loggedUserIsMemberOfSelector('observers');
export const loggedUserIsSupervisorOfSelector = loggedUserIsMemberOfSelector('supervisors');
export const loggedUserIsAdminOfSelector = loggedUserIsMemberOfSelector('admins');

export const loggedUserIsPrimaryAdminOfSelector = createSelector(
  [loggedInUserIdSelector, groupsSelector],
  (userId, groups) => groupId => groups.getIn([groupId, 'data', 'primaryAdminsIds'], EMPTY_LIST).includes(userId)
);

/*
 * Specialized selectors that we might want to replace/generalize in the future
 */

const filterNonOrganizationalActiveGroups = groups =>
  groups.filter(group => !group.getIn(['data', 'organizational'], false) && !group.getIn(['data', 'archived'], false));

export const loggedInSupervisorOfNonOrganizationalSelector = createSelector(
  loggedUserSupervisorOfGroupsSelector,
  filterNonOrganizationalActiveGroups
);

const groupsUserCanEditSelector = strict =>
  createSelector(
    [loggedInUserIdSelector, groupsSelector, state => isLoggedAsSuperAdmin(state)],
    (userId, groups, isSuperAdmin) => {
      const readyGroups = groups.filter(isReady);
      return isSuperAdmin && !strict
        ? readyGroups
        : readyGroups.filter(group => {
            const groupData = getJsData(group);
            return (
              groupData.privateData &&
              (groupData.privateData.supervisors.indexOf(userId) >= 0 ||
                (strict ? groupData.primaryAdminsIds : groupData.privateData.admins).indexOf(userId) >= 0)
            );
          });
    }
  );

export const loggedUserCanAssignToGroupsSelector = createSelector(
  groupsUserCanEditSelector(false),
  filterNonOrganizationalActiveGroups
);

export const loggedUserCanInviteToGroupsSelector = createSelector(
  groupsUserCanEditSelector(true),
  filterNonOrganizationalActiveGroups
);
