import { createSelector } from 'reselect';

// all the groups in the state
const allGroups = (state) => state.groups;

// all the groups which
const usersGroups = (state) => state.user.groups;

export default createSelector(
  [ allGroups, usersGroups ],
  // intersect all the groups with
  (groups, memberOf) => groups.filter(group => memberOf.indexOf(group.id) !== -1)
);
