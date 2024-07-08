import { createSelector } from 'reselect';
import { statusTypes } from '../modules/authTypes.js';
import { isTokenValid } from '../helpers/token';

const getParam = (_, param) => param;
const getAuth = state => state.auth;
const getAccessToken = auth => auth.get('accessToken');
const getLoggedInUserId = auth => auth.get('userId');
const getSelectedInstanceId = auth => auth.get('instanceId');
const getStatus = createSelector(getAuth, auth => auth.get('status'));
const getErrors = createSelector(getAuth, auth => auth.get('errors'));
const getChangePasswordStatus = createSelector(getAuth, auth => auth.get('changePasswordStatus'));
const getResetPasswordStatus = createSelector(getAuth, auth => auth.get('resetPasswordStatus'));

/**
 * Select access token from the state.
 */
export const jwtSelector = createSelector(getAuth, auth => auth.get('jwt'));
export const accessTokenSelector = createSelector(getAuth, getAccessToken);
export const accessTokenExpiration = createSelector(accessTokenSelector, token =>
  token ? token.get('exp') * 1000 : 0
);
export const loggedInUserIdSelector = createSelector(getAuth, getLoggedInUserId);

export const selectedInstanceId = createSelector(getAuth, getSelectedInstanceId);

export const statusSelector = service => createSelector(getStatus, statuses => statuses.get(service));

export const loginErrorSelector = createSelector(
  [getErrors, getParam],
  (errors, service) => errors?.get(service)?.toJS() || null
);

export const isLoggingIn = service =>
  createSelector(statusSelector(service), state => state === statusTypes.LOGGING_IN);
export const hasFailed = service =>
  createSelector(statusSelector(service), state => state === statusTypes.LOGIN_FAILED);
export const hasSucceeded = service =>
  createSelector(statusSelector(service), status => status === statusTypes.LOGGED_IN);

export const isLoggedIn = createSelector(
  getAuth,
  auth => Boolean(auth.get('userId')) && isTokenValid(auth.get('accessToken').toJS())
);

export const isChanging = createSelector(getChangePasswordStatus, status => status === 'PENDING');
export const hasChangingFailed = createSelector(getChangePasswordStatus, status => status === 'FAILED');
export const hasChangingSucceeded = createSelector(getChangePasswordStatus, status => status === 'FULFILLED');

export const isReseting = createSelector(getResetPasswordStatus, status => status === 'PENDING');
export const hasResetingFailed = createSelector(getResetPasswordStatus, status => status === 'FAILED');
export const hasResetingSucceeded = createSelector(getResetPasswordStatus, status => status === 'FULFILLED');

export const lastGeneratedToken = createSelector(getAuth, auth => auth.get('lastGeneratedToken', ''));
