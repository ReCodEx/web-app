import { createSelector } from 'reselect';
import { List } from 'immutable';

import { loggedInUserIdSelector } from './auth';
import { groupSelector, studentsOfGroup, supervisorsOfGroup } from './groups';
import { exerciseSelector } from './exercises';
import { isReady, getJsData } from '../helpers/resourceManager';

const getUsers = state => state.users.get('resources');

/**
 * Select users part of the state
 */
export const usersSelector = getUsers;

export const getUser = userId =>
  createSelector(usersSelector, users => users.get(userId));

export const readyUsersDataSelector = createSelector(usersSelector, users =>
  users
    .toList()
    .filter(isReady)
    .map(getJsData)
    .sort((a, b) => {
      if (a.name.lastName < b.name.lastName) return -1;
      if (a.name.lastName > b.name.lastName) return 1;
      if (a.name.firstName < b.name.firstName) return -1;
      if (a.name.firstName > b.name.firstName) return 1;
      return 0;
    })
    .toArray()
);

export const isVerified = userId =>
  createSelector(
    getUser(userId),
    user => (user ? user.getIn(['data', 'isVerified']) === true : false)
  );

export const getRole = userId =>
  createSelector(
    getUser(userId),
    user => (user ? user.getIn(['data', 'role']) : null)
  );

export const isStudent = userId =>
  createSelector(getRole(userId), role => role === 'student');

export const isSupervisor = userId =>
  createSelector(getRole(userId), role => role === 'supervisor');

export const isSuperAdmin = userId =>
  createSelector(getRole(userId), role => role === 'superadmin');

export const getUserSettings = userId =>
  createSelector(
    getUser(userId),
    user => (isReady(user) ? user.getIn(['data', 'settings']).toJS() : {})
  );

export const loggedInUserSelector = createSelector(
  [usersSelector, loggedInUserIdSelector],
  (users, id) => users.get(id)
);

export const memberOfInstancesIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      (user && isReady(user)
        ? List([user.getIn(['data', 'instanceId'])])
        : List()) // @todo: Change when the user can be member of multiple instances
  );

export const studentOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      (user && isReady(user)
        ? user.getIn(['data', 'groups', 'studentOf'])
        : List())
  );

export const supervisorOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      (user && isReady(user)
        ? user.getIn(['data', 'groups', 'supervisorOf'])
        : List())
  );

export const isStudentOf = (userId, groupId) =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), studentsOfGroup(groupId)],
    (groupIds, studentsIds) =>
      groupIds.indexOf(groupId) >= 0 || studentsIds.indexOf(userId) >= 0
  );

export const isSupervisorOf = (userId, groupId) =>
  createSelector(
    [supervisorOfGroupsIdsSelector(userId), supervisorsOfGroup(groupId)],
    (groupIds, supervisorsIds) =>
      groupIds.indexOf(groupId) >= 0 || supervisorsIds.indexOf(userId) >= 0
  );

export const isAdminOf = (userId, groupId) =>
  createSelector(
    [groupSelector(groupId), isSuperAdmin(userId)],
    (group, isSuperAdmin) =>
      isSuperAdmin === true ||
      (group && isReady(group) && group.getIn(['data', 'adminId']) === userId)
  );

export const isMemberOf = (userId, groupId) =>
  createSelector(
    [
      isStudentOf(userId, groupId),
      isSupervisorOf(userId, groupId),
      isAdminOf(userId, groupId)
    ],
    (student, supervisor, admin) => student || supervisor || admin
  );

export const usersGroupsIds = userId =>
  createSelector(
    [studentOfGroupsIdsSelector(userId), supervisorOfGroupsIdsSelector(userId)],
    (student, supervisor) => student.concat(supervisor)
  );

export const canEditExercise = (userId, exerciseId) =>
  createSelector(
    [exerciseSelector(exerciseId), isSuperAdmin(userId)],
    (exercise, isSuperAdmin) =>
      isSuperAdmin ||
      (exercise &&
        isReady(exercise) &&
        exercise.getIn(['data', 'authorId']) === userId)
  );

export const notificationsSelector = createSelector(
  loggedInUserSelector,
  user =>
    (user && user.get('data') && user.getIn(['data', 'groupsStats'])
      ? user.getIn(['data', 'groupsStats']).reduce(
          (notifications, group) =>
            Object.assign({}, notifications, {
              [group.id]: group.stats.assignments.total -
                group.stats.assignments.completed -
                group.stats.assignments.missed
            }),
          {}
        )
      : {})
);
