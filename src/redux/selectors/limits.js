import { createSelector } from 'reselect';

import { endpointDisguisedAsIdFactory } from '../modules/limits';

const getLimits = state => state.limits;

export const limitsSelector = (exerciseId, runtimeEnvironmentId, hwGroup) =>
  createSelector(getLimits, limits =>
    limits.getIn([
      'resources',
      endpointDisguisedAsIdFactory({
        exerciseId,
        runtimeEnvironmentId,
        hwGroup
      })
    ])
  );
