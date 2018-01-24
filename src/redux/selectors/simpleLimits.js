import { createSelector } from 'reselect';

const getLimits = state => state.simpleLimits;

export const simpleLimitsSelector = createSelector(getLimits, limits =>
  limits.get('resources')
);
