import { createSelector } from 'reselect';
import { List } from 'immutable';

import { studentOfGroupsIdsSelector, supervisorOfGroupsIdsSelector } from './users';
import { getAssignments } from './assignments';
import { isReady } from '../helpers/resourceManager';


/**
 * Select groups part of the state
 */

export const groupsSelectors = state => state.groups.get('resources');
const filterGroups = (ids, groups) => ids.map(id => groups.get(id)).filter(isReady);

export const studentOfSelector = createSelector(
  [ studentOfGroupsIdsSelector, groupsSelectors ],
  filterGroups
);

export const supervisorOfSelector = createSelector(
  [ supervisorOfGroupsIdsSelector, groupsSelectors ],
  filterGroups
);

export const groupSelector = id => createSelector(
  groupsSelectors,
  groups => groups.get(id)
);

export const groupsAssignmentsIdsSelector = id => createSelector(
  groupSelector(id),
  group => group && isReady(group) ? group.getIn(['data', 'assignments']) : List()
);

export const createGroupsAssignmentsSelector = id =>
  createSelector(
    [ groupsAssignmentsIdsSelector(id), getAssignments ],
    (groupsAssignmentsIds, assignments) =>
      groupsAssignmentsIds.map(id => assignments.getIn(['resources', id]))
  );
