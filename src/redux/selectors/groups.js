import { createSelector } from 'reselect';
import { List } from 'immutable';

import { studentOfGroupsIdsSelector, supervisorOfGroupsIdsSelector } from './users';
import { getAssignments } from './assignments';
import { isReady } from '../helpers/resourceManager';


/**
 * Select groups part of the state
 */

const getGroups = state => state.groups.get('resources');
const filterGroups = (ids, groups) => ids.map(id => groups.get(id)).filter(isReady);

export const studentOfSelector = createSelector(
  [ studentOfGroupsIdsSelector, getGroups ],
  filterGroups
);

export const supervisorOfSelector = createSelector(
  [ supervisorOfGroupsIdsSelector, getGroups ],
  filterGroups
);

export const groupSelector = createSelector(
  [ getGroups, (state, id) => id ],
  (groups, id) => groups.get(id)
);

export const groupsAssignmentsIdsSelector = createSelector(
  groupSelector,
  group => group && isReady(group) ? group.getIn(['data', 'assignments']) : List()
);

export const createGroupsAssignmentsSelector = () =>
  createSelector(
    [ groupsAssignmentsIdsSelector, getAssignments ],
    (groupsAssignmentsIds, assignments) =>
      groupsAssignmentsIds.map(assignment => assignments.get(assignment.id))
  );
