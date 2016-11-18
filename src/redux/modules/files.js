import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'files';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (id) => `/uploaded-files/${id}`
});

/**
 * Actions
 */

export const loadFile = actions.pushResource;
export const fetchFileIfNeeded = actions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);

export default reducer;
