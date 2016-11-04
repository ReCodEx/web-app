import { createAction, handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'filesContent';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (id) => `/uploaded-files/${id}/content`,
});

export const fetchContentIfNeeded = actions.fetchOneIfNeeded;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
