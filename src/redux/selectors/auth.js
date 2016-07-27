import { createSelector } from 'reselect';

const getAuth = state => state.auth;
const getAccessToken = auth => auth.accessToken;
const getLoggedInUserId = auth => auth.userId;

/**
 * Select access token from the state.
 */
export const accessTokenSelector = createSelector(getAuth, getAccessToken);
export const loggedInUserId = createSelector(getAuth, getLoggedInUserId);
