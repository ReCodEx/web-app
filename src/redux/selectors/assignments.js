import { createSelector } from 'reselect';
import { List } from 'immutable';
import { getSubmissions } from './submissions';

export const getAssignments = state => state.assignments;
export const createAssignmentSelector = () =>
  createSelector([getAssignments, (state, id) => id], (assignments, id) =>
    assignments.getIn(['resources', id])
  );

export const getAssignment = id =>
  createSelector(getAssignments, assignments =>
    assignments.getIn(['resources', id])
  );

export const runtimeEnvironmentsSelector = id =>
  createSelector(
    getAssignment(id),
    assignment =>
      assignment && assignment.get('data') !== null
        ? assignment.getIn(['data', 'runtimeEnvironmentsIds'])
        : List()
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
