import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';
import factory, { initialState } from '../helpers/resourceManager';
import { additionalActionTypes as additionalSubmissionActionTypes } from './submissions';

/**
 * Create actions & reducer
 */

const resourceName = 'stats';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/students/stats`
});

export const fetchGroupsStats = actions.fetchResource;
export const fetchGroupsStatsIfNeeded = actions.fetchIfNeeded;

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalSubmissionActionTypes.ACCEPT_FULFILLED]: (state, { payload }) =>
      state.updateIn(['resources', payload.groupId, 'data'], stats => {
        if (!stats) {
          stats = List();
        }
        return stats
          .filter(userStats => userStats.get('userId') !== payload.userId)
          .push(fromJS(payload));
      }),
    [additionalSubmissionActionTypes.UNACCEPT_FULFILLED]: (
      state,
      { payload }
    ) =>
      state.updateIn(['resources', payload.groupId, 'data'], stats => {
        if (!stats) {
          stats = List();
        }
        return stats
          .filter(userStats => userStats.get('userId') !== payload.userId)
          .push(fromJS(payload));
      })
  }),
  initialState
);
export default reducer;
