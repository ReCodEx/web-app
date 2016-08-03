import { createSelector } from 'reselect';
import { studentOfGroupsIds, supervisorOfGroupsIds } from './users';

const getGroups = state => state.groups.get('resources');
const filterGroups = (ids, groups) => ids.map(id => groups.get(id)).filter(group => !!group);

/**
 * Select groups part of the state
 */

export const studentOfSelector = state => {
  const ids = studentOfGroupsIds(state);
  const groups = getGroups(state);
  return filterGroups(ids, groups);
};

export const supervisorOfSelector = state => {
  const ids = supervisorOfGroupsIds(state);
  const groups = getGroups(state);
  return filterGroups(ids, groups);
};
