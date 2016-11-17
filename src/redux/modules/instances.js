import { handleActions } from 'redux-actions';
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

const addGroup = (state, group) => {
  if (group.parentGroupId === null && state.hasIn(['resources', group.instanceId])) {
    return state.updateIn(
      ['resources', group.instanceId, 'data', 'topLevelGroups'],
      groups => groups.push(group.id).toSet().toList()
    );
  }

  return state;
};

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
  },

  [groupsActionTypes.FETCH_FULFILLED]: (state, { payload: group }) => addGroup(state, group),
  [groupsActionTypes.FETCH_MANY_FULFILLED]: (state, { payload: groups }) => groups.reduce(addGroup, state)

}), initialState);

export default reducer;
