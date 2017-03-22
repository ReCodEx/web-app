import { createSelector } from 'reselect';

const getLicences = state => state.licences;

export const getLicencesOfInstance = (instanceId) =>
  createSelector(
    getLicences,
    licences => licences.getIn([ 'resources', instanceId ])
  );
