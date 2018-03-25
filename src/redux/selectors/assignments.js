import { createSelector } from 'reselect';
import { EMPTY_LIST, EMPTY_ARRAY } from '../../helpers/common';
import { getSubmissions } from './submissions';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';

export const getAssignments = state => state.assignments;

const getAssignmentResources = state => getAssignments(state).get('resources');

export const getAssignment = createSelector(
  getAssignmentResources,
  assignments => id => assignments.get(id)
);

export const assignmentEnvironmentsSelector = createSelector(
  [getAssignment, runtimeEnvironmentSelector],
  (assignmentSelector, envSelector) => id => {
    const assignment = assignmentSelector(id);
    const envIds =
      assignment && assignment.getIn(['data', 'runtimeEnvironmentIds']);
    return envIds && envSelector
      ? envIds.toArray().map(envSelector)
      : EMPTY_ARRAY;
  }
);

export const getUserSubmissions = (userId, assignmentId) =>
  createSelector(
    [getSubmissions, getAssignments],
    (submissions, assignments) => {
      const assignmentSubmissions = assignments.getIn([
        'submissions',
        assignmentId,
        userId
      ]);
      if (!assignmentSubmissions) {
        return EMPTY_LIST;
      }

      return assignmentSubmissions
        .map(id => submissions.get(id))
        .filter(a => a);
    }
  );
