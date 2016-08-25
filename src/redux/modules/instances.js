import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord } from '../helpers/resourceManager';
import { memberOfInstancesIdsSelector } from '../selectors/users';

const resourceName = 'instances';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  LOAD_INSTANCES: 'recodex/instances/LOAD_INSTANCES',
  LOAD_INSTANCES_PENDING: 'recodex/instances/LOAD_INSTANCES_PENDING',
  LOAD_INSTANCES_FULFILLED: 'recodex/instances/LOAD_INSTANCES_FULFILLED',
  LOAD_INSTANCES_REJECTED: 'recodex/instances/LOAD_INSTANCES_REJECTED'
};

export const loadInstance = actions.pushResource;
export const fetchInstancesIfNeeded = actions.fetchIfNeeded;
export const fetchInstanceIfNeeded = actions.fetchOneIfNeeded;

export const fetchInstances = () =>
  createApiAction({
    type: actionTypes.LOAD_INSTANCES,
    endpoint: '/instances',
    method: 'GET'
  });

export const fetchUsersInstancesIfNeeded = (userId) =>
  createApiAction({
    type: actionTypes.LOAD_INSTANCES,
    endpoint: `/users/${userId}/instances`,
    method: 'GET'
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.LOAD_INSTANCES_FULFILLED]: (state, { payload }) => {
    return payload.reduce((state, instance) => state.setIn(['resources', instance.id], createRecord(false, false, false, instance)), state);
  }

}), initialState);

export default reducer;
