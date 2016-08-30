import { createSelector } from 'reselect';
import { List } from 'immutable';

import { loggedInUserIdSelector } from './auth';

const getUsers = state => state.users.get('resources');
const getGroups = type => user => {
  if (user !== null) {
    return user.getIn(['groups', type]);
  }

  return List();
};

/**
 * Select users part of the state
 */
export const usersSelector = getUsers;

export const getUser = createSelector(
  [ usersSelector, (state, id) => id ],
  (users, id) => users.get(id)
);

export const loggedInUserDataSelector = createSelector(
  [ getUsers, loggedInUserIdSelector ],
  (users, id) => users.getIn([id, 'data'])
);

export const memberOfInstancesIdsSelector = createSelector(
  loggedInUserDataSelector,
  user => user ? List([ user.getIn(['instanceId']) ]) : List() // @todo: Change when the user can be member of multiple instances
);

export const studentOfGroupsIdsSelector = createSelector(
  loggedInUserDataSelector,
  user => user ? user.getIn(['groups', 'studentOf']) : List()
);

export const isStudentOf = groupId => createSelector(
  studentOfGroupsIdsSelector,
  ids => ids.some(id => id === groupId)
);

export const isSupervisorOf = groupId => createSelector(
  supervisorOfGroupsIdsSelector,
  ids => ids.some(id => id === groupId)
);

export const isAdminOf = groupId => createSelector(
  [ loggedInUserIdSelector, state => state.groups.getIn(['resources', groupId, 'data', 'adminId']) ],
  (userId, adminId) => adminId === userId
);

export const isMemberOf = groupId => {
  const studentOf = isStudentOf(groupId);
  const supervisorOf = isSupervisorOf(groupId);
  return state => studentOf(state) || supervisorOf(state);
};

export const supervisorOfGroupsIdsSelector = createSelector(
  loggedInUserDataSelector,
  user => user ? user.getIn(['groups', 'supervisorOf']) : List()
);

export const usersGroupsIds = createSelector(
  [ studentOfGroupsIdsSelector, supervisorOfGroupsIdsSelector ],
  (student, supervisor) => student.concat(supervisor)
);

export const notificationsSelector = createSelector(
  loggedInUserDataSelector,
  userData =>
    userData && userData.get('groupsStats')
      ? userData.get('groupsStats').reduce(
        (notifications, group) =>
          Object.assign({}, notifications, { [group.id]: group.stats.assignments.total - group.stats.assignments.completed }),
        {})
      : {}
);
