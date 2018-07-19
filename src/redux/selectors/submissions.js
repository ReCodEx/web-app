import { createSelector } from 'reselect';

export const getSubmissions = state => state.submissions.get('resources');
export const getSubmission = id =>
  createSelector(getSubmissions, submissions => submissions.get(id));

export const isAccepted = id =>
  createSelector(getSubmission(id), submission =>
    submission.getIn(['data', 'accepted'], false)
  );

export const isAcceptPending = id =>
  createSelector(getSubmission(id), submission =>
    submission.getIn(['data', 'accepted-pending'], false)
  );
