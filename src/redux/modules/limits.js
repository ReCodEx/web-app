import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'limits';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: id => `/exercise-assignments/${id}/limits`
});

/**
 * Actions
 */

export const loadLimits = actions.pushResource;
export const fetchLimitsIfNeeded = actions.fetchOneIfNeeded;
export const editLimits = actions.updateResource;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;

