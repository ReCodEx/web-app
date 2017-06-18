import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { additionalActionTypes as additionalGroupActionTypes } from './groups';
import {
  additionalActionTypes as additionalSubmissionActionTypes
} from './submissions';

/**
 * Create actions & reducer
 */

const resourceName = 'stats';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/students/stats`
});

export const fetchGroupsStatsIfNeeded = actions.fetchOneIfNeeded;
const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalGroupActionTypes.LOAD_USERS_GROUPS_FULFILLED]: (
      state,
      { payload }
    ) => {
      payload.stats.map(item => {
        state.setIn(
          'resources',
          item.id,
          createRecord({
            data: item,
            status: resourceStatus.FULFILLED
          })
        );
      });

      return state;
    },
    [additionalSubmissionActionTypes.ACCEPT_FULFILLED]: (state, { payload }) =>
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
