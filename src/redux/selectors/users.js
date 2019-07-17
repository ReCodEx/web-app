import { createSelector } from 'reselect';

import { EMPTY_LIST, EMPTY_OBJ } from '../../helpers/common';
import { isReady, getJsData } from '../helpers/resourceManager';
import { extractLanguageFromUrl } from '../../links';
import { isStudentRole, isSupervisorRole, isSuperadminRole } from '../../components/helpers/usersRoles';

import { fetchManyEndpoint } from '../modules/users';
import { loggedInUserIdSelector } from './auth';
import { groupSelectorCreator, studentsOfGroup, supervisorsOfGroup, groupsSelector } from './groups';
import { pipelineSelector } from './pipelines';

const getParam = (state, id) => id;

const getUsers = state => state.users;
const getResources = users => users.get('resources');
const getLang = state => extractLanguageFromUrl(state.routing.locationBeforeTransitions.pathname);

/**
 * Select users part of the state
 */
export const usersSelector = createSelector(
  getUsers,
  getResources
);

export const fetchManyStatus = createSelector(
  getUsers,
  state => state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const fetchUserStatus = createSelector(
  [usersSelector, getParam],
  (users, id) => users.getIn([id, 'state'])
);

export const getUser = userId =>
  createSelector(
    usersSelector,
    users => users.get(userId)
  );

export const readyUsersDataSelector = createSelector(
  [usersSelector, getLang],
  (users, lang) =>
    users
      .toList()
      .filter(isReady)
      .map(getJsData)
      .sort(
        (a, b) =>
          a.name.lastName.localeCompare(b.name.lastName, lang) || a.name.firstName.localeCompare(b.name.firstName, lang)
      )
      .toArray()
);

export const supervisorsOfGroupSelector = createSelector(
  [readyUsersDataSelector, groupsSelector, getParam],
  (users, groups, groupId) =>
    users.filter(user =>
      groups
        .getIn([groupId, 'data', 'privateData', 'supervisors'], EMPTY_LIST)
        .toJS()
        .includes(user.id)
    )
);

export const studentsOfGroupSelector = createSelector(
  [readyUsersDataSelector, groupsSelector, getParam],
  (users, groups, groupId) =>
    users.filter(user =>
      groups
        .getIn([groupId, 'data', 'privateData', 'students'], EMPTY_LIST)
        .toJS()
        .includes(user.id)
    )
);

export const isVerified = userId =>
  createSelector(
    getUser(userId),
    user => (user ? user.getIn(['data', 'isVerified']) === true : false)
  );

export const getRole = userId =>
  createSelector(
    getUser(userId),
    user => (user ? user.getIn(['data', 'privateData', 'role']) : null)
  );

export const isStudent = userId =>
  createSelector(
    getRole(userId),
    role => isStudentRole(role)
  );

export const isSupervisor = userId =>
  createSelector(
    getRole(userId),
    role => isSupervisorRole(role)
  );

const userSettingsSelector = user =>
  isReady(user) ? user.getIn(['data', 'privateData', 'settings']).toJS() : EMPTY_OBJ;

export const getUserSettings = userId =>
  createSelector(
    getUser(userId),
    userSettingsSelector
  );

export const loggedInUserSelector = createSelector(
  [usersSelector, loggedInUserIdSelector],
  (users, id) => (id && users ? users.get(id) : null)
);

export const getLoggedInUserSettings = createSelector(
  loggedInUserSelector,
  userSettingsSelector
);

export const isLoggedAsSuperAdmin = createSelector(
  [loggedInUserSelector],
  loggedInUser =>
    loggedInUser && isReady(loggedInUser)
      ? isSuperadminRole(loggedInUser.getIn(['data', 'privateData', 'role']))
      : false
);

export const isLoggedAsSupervisor = createSelector(
  [loggedInUserSelector],
  loggedInUser =>
    loggedInUser && isReady(loggedInUser)
      ? isSupervisorRole(loggedInUser.getIn(['data', 'privateData', 'role']))
      : false
);

export const memberOfInstancesIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user => (user && isReady(user) ? user.getIn(['data', 'privateData', 'instancesIds'], EMPTY_LIST) : EMPTY_LIST)
  );

export const studentOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      user && isReady(user) ? user.getIn(['data', 'privateData', 'groups', 'studentOf'], EMPTY_LIST) : EMPTY_LIST
  );

export const supervisorOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      user && isReady(user) ? user.getIn(['data', 'privateData', 'groups', 'supervisorOf'], EMPTY_LIST) : EMPTY_LIST
  );

export const isStudentOf = (userId, groupId) =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), studentsOfGroup(groupId)],
    (groupIds, studentsIds) => groupIds.indexOf(groupId) >= 0 || studentsIds.indexOf(userId) >= 0
  );

export const isSupervisorOf = (userId, groupId) =>
  createSelector(
    [supervisorOfGroupsIdsSelector(userId), supervisorsOfGroup(groupId)],
    (groupIds, supervisorsIds) => groupIds.indexOf(groupId) >= 0 || supervisorsIds.indexOf(userId) >= 0
  );

export const isAdminOf = (userId, groupId) =>
  createSelector(
    [groupSelectorCreator(groupId), isLoggedAsSuperAdmin],
    (group, isSuperAdmin) =>
      isSuperAdmin === true ||
      (group &&
        isReady(group) &&
        group.hasIn(['data', 'privateData', 'admins']) &&
        group.getIn(['data', 'privateData', 'admins']).indexOf(userId) >= 0)
  );

export const isMemberOf = (userId, groupId) =>
  createSelector(
    [isStudentOf(userId, groupId), isSupervisorOf(userId, groupId), isAdminOf(userId, groupId)],
    (student, supervisor, admin) => student || supervisor || admin
  );

export const usersGroupsIds = userId =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), supervisorOfGroupsIdsSelector(userId)],
    (student, supervisor) => student.concat(supervisor)
  );

export const canEditPipeline = (userId, pipelineId) =>
  createSelector(
    [pipelineSelector(pipelineId), isLoggedAsSuperAdmin],
    (pipeline, isSuperAdmin) =>
      isSuperAdmin || (pipeline && isReady(pipeline) && pipeline.getIn(['data', 'author']) === userId)
  );

export const notificationsSelector = createSelector(
  loggedInUserSelector,
  user =>
    user && user.get('data') && user.getIn(['data', 'groupsStats'])
      ? user.getIn(['data', 'groupsStats'], EMPTY_LIST).reduce(
          (notifications, group) =>
            Object.assign({}, notifications, {
              [group.id]:
                group.stats.assignments.total - group.stats.assignments.completed - group.stats.assignments.missed,
            }),
          {}
        )
      : EMPTY_OBJ
);

export const userIsAllowed = createSelector(
  usersSelector,
  users => id => {
    const user = users && users.get(id);
    return user && isReady(user) ? user.getIn(['data', 'privateData', 'isAllowed'], null) : null;
  }
);

export const userIsAllowedPending = createSelector(
  usersSelector,
  users => id => {
    const user = users && users.get(id);
    return user && isReady(user) ? user.getIn(['data', 'isAllowed-pending'], false) : null;
  }
);
