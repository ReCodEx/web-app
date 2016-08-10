import { createSelector } from 'reselect';
import { statusTypes } from '../modules/auth';

const getAuth = state => state.auth;
const getAccessToken = auth => auth.get('accessToken');
const getLoggedInUserId = auth => auth.get('userId');
const getStatus = auth => auth.get('status');

/**
 * Select access token from the state.
 */
export const accessTokenSelector = createSelector(getAuth, getAccessToken);
export const loggedInUserIdSelector = createSelector(getAuth, getLoggedInUserId);
export const statusSelector = createSelector(getAuth, getStatus);
export const isLoggingIn = createSelector(statusSelector, state => state === statusTypes.LOGGING_IN);
export const hasFailed = createSelector(statusSelector, state => state === statusTypes.LOGIN_FAILED);
export const hasSucceeded = createSelector(statusSelector, state => state === statusTypes.LOGGED_IN);
export const isLoggedIn = hasSucceeded;
