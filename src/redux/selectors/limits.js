import { createSelector } from 'reselect';

export const getLimitsSection = (state) => state.limits;
export const getEnvironmentsLimits = (id) =>
  createSelector(
    getLimitsSection,
    limits => limits.getIn([ 'resources', id ])
  );
