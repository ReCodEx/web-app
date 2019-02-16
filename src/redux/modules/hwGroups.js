import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'hwGroups';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const fetchHardwareGroup = actions.fetchResource;
export const fetchHardwareGroupIfNeeded = actions.fetchOneIfNeeded;

export const fetchHardwareGroups = () =>
  actions.fetchMany({
    endpoint: '/hardware-groups',
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
