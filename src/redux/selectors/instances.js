import { createSelector } from 'reselect';
import { List } from 'immutable';
import { EMPTY_LIST } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { loggedInUserSelector } from './users';

const getInstances = state => state.instances;
const getResources = instances => instances.get('resources');

export const instancesSelector = createSelector(getInstances, getResources);
export const instanceSelector = createSelector(
  [instancesSelector, (state, id) => id],
  (instances, id) => instances.get(id)
);

// export const instanceForGroupSelector =

export const publicInstancesSelector = createSelector(
  instancesSelector,
  instances =>
    instances.filter(instance => instance.getIn(['data', 'isOpen']) === true)
);

export const instanceByIdSelector = instanceId =>
  createSelector([instancesSelector], instances => instances.get(instanceId));

export const loggedInUserMemberOfInstances = createSelector(
  [loggedInUserSelector, instancesSelector],
  (user, instances) => {
    const instanceId =
      user &&
      isReady(user) &&
      user.getIn(['data', 'privateData', 'instanceId']);
    const instance = instanceId && instances.get(instanceId);
    return instance ? List([instance]) : EMPTY_LIST;
  }
);

export const isAdminOfInstance = (userId, instanceId) =>
  createSelector(
    instanceByIdSelector(instanceId),
    instance =>
      !!instance &&
      isReady(instance) &&
      instance.getIn(['data', 'admin']) === userId
  );
