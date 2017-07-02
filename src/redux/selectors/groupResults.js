import { createSelector } from 'reselect';

export const getGroupResults = state => state.groupResults;
export const getBestSubmission = (userId, assignmentId) =>
  createSelector(
    getGroupResults,
    groupResults =>
      groupResults &&
        groupResults.get(assignmentId) !== null &&
        groupResults.getIn([assignmentId, userId]) !== null
        ? groupResults.getIn([assignmentId, userId])
        : {}
  );
