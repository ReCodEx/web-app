import { createAction, handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
  defaultNeedsRefetching
} from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submissions';
import { createApiAction } from '../middleware/apiMiddleware';

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
