import { createSelector } from 'reselect';

const getProfiles = state => state.publicProfiles.get('resources');

/**
 * Select users part of the state
 */
export const profilesSelector = getProfiles;

export const getProfile = userId =>
  createSelector(profilesSelector, users => users.get(userId));
