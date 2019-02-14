import { createSelector } from 'reselect';

const getLimits = state => state.limits;
const getParam = (state, id) => id;

export const limitsSelector = createSelector(
  [getLimits, getParam],
  (limits, exerciseId) => limits.getIn(['resources', exerciseId])
);
