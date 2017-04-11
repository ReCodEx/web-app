import { createSelector } from 'reselect';
import { referenceSolutionStatus } from '../modules/referenceSolution';
const { CREATING, SENDING, FAILED } = referenceSolutionStatus;

export const getReferenceSolution = state => state.referenceSolution;

export const getStatus = createSelector(getReferenceSolution, state =>
  state.get('status'));
export const isProcessing = createSelector(
  getStatus,
  state => state === referenceSolutionStatus.PROCESSING
);
export const isSubmitting = createSelector(
  getStatus,
  state => state === CREATING || state === SENDING || state === FAILED
);
export const isSending = createSelector(getStatus, state => state === SENDING);
export const hasFailed = createSelector(getStatus, state => state === FAILED);
