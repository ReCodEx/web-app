import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';
import { actionTypes as groupsActionTypes } from './groups';

const resourceName = 'instances';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const loadInstance = actions.pushResource;
export const fetchInstancesIfNeeded = actions.fetchIfNeeded;
export const fetchInstanceIfNeeded = actions.fetchOneIfNeeded;

export const fetchInstances = () =>
  actions.fetchMany({
    endpoint: '/instances'
  });

export const fetchUsersInstancesIfNeeded = (userId) =>
  actions.fetchMany({
    endpoint: `/users/${userId}/instances`
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [groupsActionTypes.ADD_FULFILLED]: (state, { payload: group }) => {
    const instance = state.getIn([ 'resources', group.instanceId ]);
    if (!instance || group.parentGroupId !== null) {
      return state;
    }

    return state.updateIn(
      [ 'resources', group.instanceId, 'data' ],
      instance => instance.update('topLevelGroups', groups => groups.push(group.id))
    );
  }

}), initialState);

export default reducer;
