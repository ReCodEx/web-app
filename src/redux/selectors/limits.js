import { createSelector } from 'reselect';
import { List } from 'immutable';
import { getSubmissions } from './submissions';

export const getLimitsSection = (state) => state.limits;
export const getLimits = (id) =>
  createSelector(
    getLimitsSection,
    limits => limits.getIn([ 'resources', id ])
  );
