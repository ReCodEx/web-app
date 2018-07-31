import { createSelector } from 'reselect';
import { submissionStatus } from '../modules/submission';
import { runtimeEnvironmentsSelector } from './runtimeEnvironments';
import { isReady } from '../helpers/resourceManager/status';
import { safeGet, EMPTY_LIST } from '../../helpers/common';

const { CREATING, VALIDATING, SENDING, FAILED } = submissionStatus;

export const getSolution = state => state.submission;

export const getNote = createSelector(getSolution, state => state.get('note'));

export const getStatus = createSelector(getSolution, state =>
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

export const getSubmissionId = createSelector(getSolution, submission =>
  submission.get('submissionId')
);

export const getMonitorParams = createSelector(getSolution, submission =>
  submission.get('monitor')
);

export const getPresubmit = createSelector(getSolution, submission =>
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

export const getPresubmitVariables = createSelector([getPresubmit], presubmit =>
  ((presubmit && presubmit.get('submitVariables')) || EMPTY_LIST).toJS()
);

// Selector helper function for presubmit variables
export const hasEntryPoint = (vars, env) =>
  Boolean(
    env &&
      safeGet(vars, [
        v => v.runtimeEnvironmentId === env,
        'variables',
        v => v.name === 'entry-point'
      ])
  );
