import { createSelector } from 'reselect';

const getLicences = state => state.licences;

export const getLicencesOfInstance = (instanceId) =>
  createSelector(
    getLicences,
    instances => instances.getIn(['resources', instanceId])
  );
