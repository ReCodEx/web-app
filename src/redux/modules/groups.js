import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState, createRecord } from '../helpers/resourceManager';

const resourceName = 'groups';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  LOAD_USERS_GROUPS: 'recodex/groups/LOAD_USERS_GROUPS',
  LOAD_USERS_GROUPS_PENDING: 'recodex/groups/LOAD_USERS_GROUPS_PENDING',
  LOAD_USERS_GROUPS_FULFILLED: 'recodex/groups/LOAD_USERS_GROUPS_FULFILLED',
  LOAD_USERS_GROUPS_REJECTED: 'recodex/groups/LOAD_USERS_GROUPS_REJECTED'
};

export const loadGroup = actions.pushResource;
export const fetchGroupsIfNeeded = actions.fetchIfNeeded;
export const fetchGroupIfNeeded = actions.fetchOneIfNeeded;

export const fetchUsersGroups = (userId) =>
  createApiAction({
    type: actionTypes.LOAD_USERS_GROUPS,
    endpoint: `/users/${userId}/groups`,
    method: 'GET'
  });

export const fetchUsersGroupsIfNeeded = (userId) =>
  (dispatch, getState) => {
    const user = getState().users.getIn(['resources', userId]);
    if (user) {
      // @todo: better caching!!
      dispatch(fetchUsersGroups(userId));
    }
  };

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.LOAD_USERS_GROUPS_FULFILLED]: (state, { payload }) => {
    const groups = [ ...payload.supervisor, ...payload.student ];
    return groups.reduce((state, group) => state.setIn(['resources', group.id], createRecord(false, false, false, group)), state);
  }

}), initialState);

export default reducer;
