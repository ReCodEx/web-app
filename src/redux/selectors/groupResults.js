import { createSelector } from 'reselect';
import { loggedInUserIdSelector } from './auth.js';

export const getGroupResults = state => state.groupResults;
export const getBestSubmission = (userId, assignmentId) =>
  createSelector(getGroupResults, groupResults =>
    groupResults &&
    groupResults.getIn(['resources', assignmentId]) !== null &&
    groupResults.getIn(['resources', assignmentId, userId]) !== null
      ? groupResults.getIn(['resources', assignmentId, userId])
      : null
  );

export const getBestSubmissionsAssoc = (assignments, users) =>
  createSelector(getGroupResults, groupResults => {
    const submissions = {};
    for (const user of users) {
      submissions[user.id] = {};
      for (const assignment of assignments) {
        const usersSubmission = groupResults.getIn(['resources', assignment.id, user.id]);
        submissions[user.id][assignment.id] = usersSubmission;
      }
    }

    return submissions;
  });

export const getBestSubmissionsForLoggedInUser = createSelector(
  [getGroupResults, loggedInUserIdSelector],
  (groupResults, userId) => {
    const submissions = {};
    groupResults.get('resources').forEach((value, assignmentId) => (submissions[assignmentId] = value.get(userId)));
    return submissions;
  }
);
