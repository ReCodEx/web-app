import { createSelector } from 'reselect';
import { getSubmissions } from './submissions';

export const getAssignments = state => state.assignments;
export const getUsersSubmissionIds = (state, userId, assignmentId) =>
  getAssignments(state).getIn(['submissions', assignmentId, userId]);

export const createGetUsersSubmissionsForAssignment = () =>
  createSelector(
    [ getUsersSubmissionIds, getSubmissions ],
    (submissionIds, submissions) => submissionIds.map(id => submissions.get(id))
  );
