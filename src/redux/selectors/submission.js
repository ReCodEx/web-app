import { createSelector } from 'reselect';
import { submissionStatus } from '../modules/submission';
const { PROCESSING, CREATING, SENDING, FAILED } = submissionStatus;

export const getSubmission = state => state.submission;
export const getNote = createSelector(getSubmission, state => state.get('note'));
export const getFiles = createSelector(getSubmission, state => state.get('files'));

export const getUploadingFiles = createSelector(getFiles, state => state.get('uploading'));
export const getUploadedFiles = createSelector(getFiles, state => state.get('uploaded'));
export const getFailedFiles = createSelector(getFiles, state => state.get('failed'));
export const getRemovedFiles = createSelector(getFiles, state => state.get('removed'));
export const canSubmit = createSelector(
  [ getUploadingFiles, getUploadedFiles, getFailedFiles ],
  (uploading, uploaded, failed) => uploading.size === 0 && uploaded.size > 0 && failed.size === 0
);

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
