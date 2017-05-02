import { createSelector } from 'reselect';

export const getEmailVerification = state => state.emailVerification;

export const userSelector = userId =>
  createSelector(getEmailVerification, emailVerification =>
    emailVerification.get(userId)
  );

export const verificationStatusSelector = userId =>
  createSelector(
    userSelector(userId),
    user => (user ? user.get('verification') : null)
  );

export const resendingStatusSelector = userId =>
  createSelector(
    userSelector(userId),
    user => (user ? user.get('resending') : null)
  );
