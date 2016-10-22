import { createSelector } from 'reselect';

export const getSubmissions = (state) => state.submissions.get('resources');
export const getSubmission = (id) =>
  createSelector(
    getSubmissions,
    submissions => submissions.get(id)
  );
