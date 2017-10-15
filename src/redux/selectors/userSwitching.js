import { createSelector } from 'reselect';

export const userSwitching = state => state.userSwitching;

export const usersSelector = createSelector(userSwitching, users =>
  Object.keys(users).map(id => users[id])
);
