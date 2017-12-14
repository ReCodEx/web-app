import { createSelector } from 'reselect';
import { List } from 'immutable';
import { fetchManyEndpoint } from '../modules/users';

import { extractLanguageFromUrl } from '../../links';
import { loggedInUserIdSelector } from './auth';
import {
  groupSelector,
  studentsOfGroup,
  supervisorsOfGroup,
  groupsSelector
} from './groups';
import { exerciseSelector } from './exercises';
import { pipelineSelector } from './pipelines';
import { isReady, getJsData } from '../helpers/resourceManager';

const getParam = (state, id) => id;
const EMPTY_LIST = List();

const getUsers = state => state.users;
const getResources = users => users.get('resources');
const getLang = state =>
  extractLanguageFromUrl(state.routing.locationBeforeTransitions.pathname);

/**
 * Select users part of the state
 */
export const usersSelector = createSelector(getUsers, getResources);

export const fetchManyStatus = createSelector(getUsers, state =>
  state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const getUser = userId =>
  createSelector(usersSelector, users => users.get(userId));

export const readyUsersDataSelector = createSelector(
  [usersSelector, getLang],
  (users, lang) =>
    users
      .toList()
      .filter(isReady)
      .map(getJsData)
      .sort(
        (a, b) =>
          a.name.lastName.localeCompare(b.name.lastName, lang) ||
          a.name.firstName.localeCompare(b.name.firstName, lang)
      )
      .toArray()
);

export const supervisorsOfGroupSelector = createSelector(
  [readyUsersDataSelector, groupsSelector, getParam],
  (users, groups, groupId) =>
    users.filter(user =>
      groups
        .getIn([groupId, 'data', 'supervisors'], EMPTY_LIST)
        .toJS()
        .includes(user.id)
    )
);

export const studentsOfGroupSelector = createSelector(
  [readyUsersDataSelector, groupsSelector, getParam],
  (users, groups, groupId) =>
    users.filter(user =>
      groups
        .getIn([groupId, 'data', 'students'], EMPTY_LIST)
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
    user => (user ? user.getIn(['data', 'role']) : null)
  );

export const isStudent = userId =>
  createSelector(getRole(userId), role => role === 'student');

export const isSupervisor = userId =>
  createSelector(getRole(userId), role => role === 'supervisor');

export const getUserSettings = userId =>
  createSelector(
    getUser(userId),
    user => (isReady(user) ? user.getIn(['data', 'settings']).toJS() : {})
  );

export const loggedInUserSelector = createSelector(
  [usersSelector, loggedInUserIdSelector],
  (users, id) => users.get(id)
);

export const isLoggedAsSuperAdmin = createSelector(
  [loggedInUserSelector],
  loggedInUser =>
    loggedInUser && isReady(loggedInUser)
      ? loggedInUser.getIn(['data', 'role']) === 'superadmin'
      : false
);

export const memberOfInstancesIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      user && isReady(user)
        ? List([user.getIn(['data', 'instanceId'])])
        : List() // @todo: Change when the user can be member of multiple instances
  );

export const studentOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      user && isReady(user)
        ? user.getIn(['data', 'groups', 'studentOf'])
        : List()
  );

export const supervisorOfGroupsIdsSelector = userId =>
  createSelector(
    getUser(userId),
    user =>
      user && isReady(user)
        ? user.getIn(['data', 'groups', 'supervisorOf'])
        : List()
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
    [groupSelector(groupId), isLoggedAsSuperAdmin],
    (group, isSuperAdmin) =>
      isSuperAdmin === true ||
      (group &&
        isReady(group) &&
        group.getIn(['data', 'admins']).indexOf(userId) >= 0)
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
    [exerciseSelector(exerciseId), isLoggedAsSuperAdmin],
    (exercise, isSuperAdmin) =>
      isSuperAdmin ||
      (exercise &&
        isReady(exercise) &&
        exercise.getIn(['data', 'authorId']) === userId)
  );

export const canEditPipeline = (userId, pipelineId) =>
  createSelector(
    [pipelineSelector(pipelineId), isLoggedAsSuperAdmin],
    (pipeline, isSuperAdmin) =>
      isSuperAdmin ||
      (pipeline &&
        isReady(pipeline) &&
        pipeline.getIn(['data', 'author']) === userId)
  );

export const notificationsSelector = createSelector(
  loggedInUserSelector,
  user =>
    user && user.get('data') && user.getIn(['data', 'groupsStats'])
      ? user.getIn(['data', 'groupsStats']).reduce(
          (notifications, group) =>
            Object.assign({}, notifications, {
              [group.id]:
                group.stats.assignments.total -
                group.stats.assignments.completed -
                group.stats.assignments.missed
            }),
          {}
        )
      : {}
);
