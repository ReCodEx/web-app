import { handleActions, createAction } from 'redux-actions';
import factory, {
  initialState,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'submissionFailures';
var { actions, actionTypes, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {};

/**
 * Actions
 */
export const fetchManyEndpoint = '/submission-failures';

export const fetchAllFailures = actions.fetchMany({
  endpoint: fetchManyEndpoint
});

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
