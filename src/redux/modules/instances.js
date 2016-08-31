import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';
import { memberOfInstancesIdsSelector } from '../selectors/users';

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
}), initialState);

export default reducer;
