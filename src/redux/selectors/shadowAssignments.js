import { createSelector } from 'reselect';

export const getShadowAssignments = state => state.shadowAssignments;

const getShadowAssignmentResources = state => getShadowAssignments(state).get('resources');

export const getShadowAssignment = createSelector(
  getShadowAssignmentResources,
  assignments => id => assignments.get(id)
);
