import { createSelector } from 'reselect';
import { statusTypes } from '../modules/auth';

const getAuth = state => state.auth;
const getAccessToken = auth => auth.get('accessToken');
const getLoggedInUserId = auth => auth.get('userId');
const getStatus = auth => auth.get('status');
const getChangePasswordStatus = createSelector(getAuth, auth => auth.get('changePasswordStatus'));
const getResetPasswordStatus = createSelector(getAuth, auth => auth.get('resetPasswordStatus'));

/**
 * Select access token from the state.
 */
export const jwtSelector = createSelector(getAuth, auth => auth.get('jwt'));
export const accessTokenSelector = createSelector(getAuth, getAccessToken);
export const accessTokenExpiration = createSelector(accessTokenSelector, token => token ? token.get('exp') * 1000 : 0);
export const loggedInUserIdSelector = createSelector(getAuth, getLoggedInUserId);
export const statusSelector = createSelector(getAuth, getStatus);
export const isLoggingIn = createSelector(statusSelector, state => state === statusTypes.LOGGING_IN);
export const hasFailed = createSelector(statusSelector, state => state === statusTypes.LOGIN_FAILED);
export const hasSucceeded = createSelector(statusSelector, state => state === statusTypes.LOGGED_IN);
export const isLoggedIn = hasSucceeded;

export const isChanging = createSelector(getChangePasswordStatus, status => status === 'PENDING');
export const hasChangingFailed = createSelector(getChangePasswordStatus, status => status === 'FAILED');
export const hasChangingSucceeded = createSelector(getChangePasswordStatus, status => status === 'FULFILLED');

export const isReseting = createSelector(getResetPasswordStatus, status => status === 'PENDING');
export const hasResetingFailed = createSelector(getResetPasswordStatus, status => status === 'FAILED');
export const hasResetingSucceeded = createSelector(getResetPasswordStatus, status => status === 'FULFILLED');
