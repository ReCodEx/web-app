import { createSelector } from 'reselect';
import { submissionStatus } from '../modules/submission';
import { runtimeEnvironmentsSelector } from './runtimeEnvironments';
import { isReady } from '../helpers/resourceManager/status';

const { CREATING, VALIDATING, SENDING, FAILED } = submissionStatus;

export const getSubmission = state => state.submission;
export const getNote = createSelector(getSubmission, state =>
  state.get('note')
);

export const getStatus = createSelector(getSubmission, state =>
  state.get('status')
);
export const isProcessing = createSelector(
  getStatus,
  state => state === submissionStatus.PROCESSING
);
export const isSubmitting = createSelector(
  getStatus,
  state =>
    state === CREATING ||
    state === VALIDATING ||
    state === SENDING ||
    state === FAILED
);
export const isValidating = createSelector(
  getStatus,
  state => state === VALIDATING
);
export const isSending = createSelector(getStatus, state => state === SENDING);
export const hasFailed = createSelector(getStatus, state => state === FAILED);

export const getSubmissionId = createSelector(getSubmission, submission =>
  submission.get('submissionId')
);

export const getMonitorParams = createSelector(getSubmission, submission =>
  submission.get('monitor')
);

export const getPresubmit = createSelector(getSubmission, submission =>
  submission.get('presubmit')
);

export const getPresubmitEnvironments = createSelector(
  [getPresubmit, runtimeEnvironmentsSelector],
  (presubmit, environments) =>
    presubmit && environments && presubmit.get('environments')
      ? presubmit
          .get('environments')
          .toArray()
          .filter(envId => isReady(environments.get(envId)))
          .map(envId => environments.getIn([envId, 'data']).toJS())
      : null
);
