import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'publicGroups';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/public`
});

/**
 * Actions
 */

export const fetchPublicGroupIfNeeded = actions.fetchOneIfNeeded;

export const fetchInstancePublicGroups = instanceId =>
  actions.fetchMany({
    endpoint: `/instances/${instanceId}/groups/public`,
    meta: { instanceId }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
