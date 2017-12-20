import { createSelector } from 'reselect';
import { List } from 'immutable';
import { getSubmissions } from './submissions';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';

export const getAssignments = state => state.assignments;

const getAssignmentResources = state => getAssignments(state).get('resources');

export const getAssignment = createSelector(
  getAssignmentResources,
  assignments => id => assignments.get(id)
);

const EMPTY_ARRAY = [];

export const assignmentEnvironmentsSelector = createSelector(
  [getAssignment, runtimeEnvironmentSelector],
  (assignmentSelector, envSelector) => id => {
    const assignment = assignmentSelector(id);
    const envIds =
      assignment && assignment.getIn(['data', 'runtimeEnvironmentsIds']);
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
        return List();
      }

      return assignmentSubmissions.map(id => submissions.get(id));
    }
  );
