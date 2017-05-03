import { createSelector } from 'reselect';

export const getSubmissions = state => state.submissions.get('resources');
export const getSubmission = id =>
  createSelector(getSubmissions, submissions => submissions.get(id));

export const isAccepted = id =>
  createSelector(
    getSubmission(id),
    submission =>
      (submission.get('data') === null
        ? false
        : submission.getIn(['data', 'accepted']))
  );
