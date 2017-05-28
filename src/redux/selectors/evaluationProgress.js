import { createSelector } from 'reselect';

export const getEvaluationProgress = state => state.evaluationProgress;
export const getExpectedTasksCount = state =>
  getEvaluationProgress(state).get('expectedTasksCount');

export const getProgress = state =>
  getEvaluationProgress(state).get('progress');
export const getCompleted = state => getProgress(state).get('completed');
export const getSkipped = state => getProgress(state).get('skipped');
export const getFailed = state => getProgress(state).get('failed');

export const getCompletedPercent = createSelector(
  getCompleted,
  getExpectedTasksCount,
  (completed, expected) => completed / expected * 100
);
export const getSkippedPercent = createSelector(
  getSkipped,
  getExpectedTasksCount,
  (skipped, expected) => skipped / expected * 100
);
export const getFailedPercent = createSelector(
  getFailed,
  getExpectedTasksCount,
  (failed, expected) => failed / expected * 100
);

export const isFinished = state =>
  getEvaluationProgress(state).get('isFinished');
export const getMessages = state =>
  getEvaluationProgress(state).get('messages');
