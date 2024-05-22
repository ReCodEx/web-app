import { createSelector } from 'reselect';

const getGroupExamLocks = state => state.groupExamLocks;
const getGroupExamLocksResources = state => getGroupExamLocks(state).get('resources');
const getParams = (_, groupId, examId) => `${groupId}/exam/${examId}`;

export const groupExamLocksSelector = createSelector([getGroupExamLocksResources, getParams], (locks, id) =>
  locks.get(id)
);
