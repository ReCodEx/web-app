import { createSelector } from 'reselect';
import { submissionStatus } from '../modules/submission';
const { CREATING, SENDING, FAILED } = submissionStatus;

export const getSubmission = state => state.submission;
export const getNote = createSelector(getSubmission, state => state.get('note'));

export const getStatus = createSelector(getSubmission, state => state.get('status'));
export const isProcessing = createSelector(getStatus, state => state === submissionStatus.PROCESSING);
export const isSubmitting = createSelector(getStatus, state => state === CREATING || state === SENDING || state === FAILED);
export const isSending = createSelector(getStatus, state => state === SENDING);
export const hasFailed = createSelector(getStatus, state => state === FAILED);

export const getSubmissionId = createSelector(
  getSubmission,
  submission => submission.get('submissionId')
);

export const getMonitorParams = createSelector(
  getSubmission,
  submission => submission.get('monitor')
);
