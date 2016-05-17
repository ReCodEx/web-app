import { createSelector } from 'reselect';

const getUser = state => state.user;
const getAccessToken = state => state.accessToken;

/**
 * Select access token from the state.
 */
export const accessTokenSelector = createSelector(getUser, getAccessToken);
