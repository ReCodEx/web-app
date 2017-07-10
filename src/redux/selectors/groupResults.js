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
        : null
  );

export const getBestSubmissionsAssoc = (assignments, users) =>
  createSelector(getGroupResults, groupResults => {
    const submissions = {};
    for (let assignment of assignments) {
      submissions[assignment.id] = {};
      for (let user of users) {
        const usersSubmission = null; // @todo
        submissions[assignment.id][user.id] = usersSubmission;
      }
    }

    return submissions;
  });
