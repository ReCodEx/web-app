import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { additionalActionTypes } from './groups';

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
    [additionalActionTypes.LOAD_USERS_GROUPS_FULFILLED]: (
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
    }
  }),
  initialState
);
export default reducer;
