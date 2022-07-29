import { createSelector } from 'reselect';

const getResources = state => state.userCalendars.get('resources');

export const getUserCalendars = userId => createSelector(getResources, userCalendars => userCalendars.get(userId));
