import { createSelector } from 'reselect';
import { EMPTY_LIST } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { loggedInUserSelector } from './users';
import { selectedInstanceId } from './auth';

const getInstances = state => state.instances;
const getResources = instances => instances.get('resources');

export const instancesSelector = createSelector(
  getInstances,
  getResources
);
export const instanceSelector = createSelector(
  [instancesSelector, (state, id) => id],
  (instances, id) => instances.get(id)
);

export const selectedInstance = createSelector(
  [selectedInstanceId, instancesSelector],
  (id, instances) => id && instances && instances.get(id)
);

export const publicInstancesSelector = createSelector(
  instancesSelector,
  instances => instances.filter(instance => instance.getIn(['data', 'isOpen']) === true)
);

export const instanceByIdSelector = instanceId =>
  createSelector(
    [instancesSelector],
    instances => instances.get(instanceId)
  );

export const loggedInUserMemberOfInstances = createSelector(
  [loggedInUserSelector, instancesSelector],
  (user, instances) => {
    const instancesIds = user && isReady(user) && user.getIn(['data', 'privateData', 'instancesIds']);
    const userInstances = instancesIds && instancesIds.map(id => instances.get(id));
    return userInstances || EMPTY_LIST;
  }
);

export const isAdminOfInstance = (userId, instanceId) =>
  createSelector(
    instanceByIdSelector(instanceId),
    instance => !!instance && isReady(instance) && instance.getIn(['data', 'admin']) === userId
  );
