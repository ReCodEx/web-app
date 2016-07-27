import { createSelector } from 'reselect';
import { loggedInUserId } from './auth';

const getUsers = state => state.users;
const getGroups = type => state => {
  if (state === null) {
    return [];
  }

  return state.groups[type];
};

/**
 * Select users part of the state
 */
export const usersSelector = createSelector(getUsers);
export const loggedInUserSelector = state => {
  const users = getUsers(state);
  const id = loggedInUserId(state);
  const item = users.get(id);
  return item ? item.data : null; // user's data might not be loaded yet
};

export const usersGroupsIds = state => {
  const user = loggedInUserSelector(state);
  return [ ...user.groups.studentOf, ...user.groups.supervisorOf ];
};

/**
 * Select groups part of the state
 */
export const studentOfGroupsIds = state =>
  getGroups('studentOf')(loggedInUserSelector(state));

export const supervisorOfGroupsIds = state =>
  getGroups('supervisorOf')(loggedInUserSelector(state));
