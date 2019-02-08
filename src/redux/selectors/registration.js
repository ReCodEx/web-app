import { createSelector } from 'reselect';
import { statusTypes } from '../modules/registration';

const getRegistration = state => state.registration;
const getStatus = registration => registration.get('status');

/**
 * Select access token from the state.
 */
export const statusSelector = createSelector(
  getRegistration,
  getStatus
);
export const isCreating = createSelector(
  statusSelector,
  state => state === statusTypes.CREATING_ACCOUNT
);
export const hasFailed = createSelector(
  statusSelector,
  state => state === statusTypes.ACCOUNT_CREATING_FAILED
);
export const hasSucceeded = createSelector(
  statusSelector,
  state => state === statusTypes.ACCOUNT_CREATED
);
