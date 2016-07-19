import { createSelector } from 'reselect';

const getUser = state => state.auth;
const getAccessToken = state => state.accessToken;

/**
 * Select access token from the state.
 */
export const accessTokenSelector = createSelector(getUser, getAccessToken);
