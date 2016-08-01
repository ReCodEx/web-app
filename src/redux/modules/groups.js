import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'groups';
const {
  actions,
  reduceActions
} = factory(resourceName, state => state.groups, id => `/groups/${id}`);

/**
 * Actions
 */

export const loadGroup = actions.pushResource;
export const fetchGroupsIfNeeded = actions.fetchIfNeeded;
export const fetchGroupIfNeeded = actions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

}), initialState);

export default reducer;
