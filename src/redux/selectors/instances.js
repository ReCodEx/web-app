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

export const publicInstancesSelector = createSelector(
  instancesSelector,
  instances => instances.filter(instance => instance.getIn([ 'data', 'isOpen' ]) === true)
);

export const instanceByIdSelector = instanceId =>
  createSelector(
    [instancesSelector],
    (instances) => instances.get(instanceId)
  );

export const memberOfInstances = userId =>
  createSelector(
    [ memberOfInstancesIdsSelector(userId), instancesSelector ],
    (ids, instances) => ids.map(id => instances.get(id)).filter(isReady)
  );

export const isAdminOfInstance = (userId, instanceId) =>
  createSelector(
    instanceByIdSelector(instanceId),
    (instance) => !!instance && isReady(instance) && instance.getIn(['data', 'admin']) === userId
  );
