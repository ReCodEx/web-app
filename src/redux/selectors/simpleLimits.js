import { createSelector } from 'reselect';

import { endpointDisguisedAsIdFactory } from '../modules/simpleLimits';

const getLimits = state => state.simpleLimits;

export const simpleLimitsSelector = (exerciseId, runtimeEnvironmentId) =>
  createSelector(getLimits, limits =>
    limits.getIn([
      'resources',
      endpointDisguisedAsIdFactory({
        exerciseId,
        runtimeEnvironmentId
      })
    ])
  );
