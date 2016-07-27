import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory from '../helpers/resourceManager';

const resourceName = 'groups';
const {
  actions,
  reducer
} = factory(resourceName, state => state.groups, id => `/groups/${id}`);

/**
 * Actions
 */

export const loadGroup = actions.pushResource;
export const fetchGroupsIfNeeded = actions.fetchIfNeeded;

/**
 * Reducer
 */

export const initialState = Map();

export default reducer;
