import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import factory, { createRecord, initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as groupsActionTypes } from './groups';

const resourceName = 'stats';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/students/stats`
});

/**
 * Actions
 */

export const fetchGroupsStatsIfNeeded = actions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

}), initialState);

export default reducer;
