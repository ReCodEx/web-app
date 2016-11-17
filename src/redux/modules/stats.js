import { createAction, handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'stats';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: groupId => `/groups/${groupId}/students/stats`
});

export const fetchGroupsStatsIfNeeded = actions.fetchOneIfNeeded;
const reducer = handleActions(reduceActions, initialState);
export default reducer;
