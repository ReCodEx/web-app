import { createSelector } from 'reselect';

const getLimits = state => state.limits;

export const limitsSelector = createSelector(getLimits, limits =>
  limits.get('resources')
);
