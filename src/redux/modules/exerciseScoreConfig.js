import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseScoreConfig';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/score-config`
});

export const fetchScoreConfig = actions.fetchResource;
export const fetchScoreConfigIfNeeded = actions.fetchOneIfNeeded;
export const setScoreConfig = actions.updateResource;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
