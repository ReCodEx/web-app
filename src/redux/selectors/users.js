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

export const studentOfGroupsIdsSelector = createSelector(
  loggedInUserDataSelector,
  user => user ? user.getIn(['groups', 'studentOf']) : List()
);

export const supervisorOfGroupsIdsSelector = createSelector(
  loggedInUserDataSelector,
  user => user ? user.getIn(['groups', 'supervisorOf']) : List()
);

export const usersGroupsIds = createSelector(
  [ studentOfGroupsIdsSelector, supervisorOfGroupsIdsSelector ],
  (student, supervisor) => student.concat(supervisor)
);

