import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { memberOfInstancesIdsSelector } from './users';

const getInstances = state => state.instances;
const getResources = instances => instances.get('resources');

export const instancesSelector = createSelector(getInstances, getResources);
export const instanceSelector = createSelector(
  [ instancesSelector, (state, id) => id ],
  (instances, id) => instances.get(id)
);

export const memberOfInstances = createSelector(
  [ memberOfInstancesIdsSelector, instancesSelector ],
  (ids, instances) => ids.map(id => instances.get(id)).filter(isReady)
);
