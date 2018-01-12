import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'submissionFailures';
var { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  RESOLVE: 'recodex/submissionFailures/RESOLVE'
};

/**
 * Actions
 */
export const fetchManyEndpoint = '/submission-failures';

export const fetchAllFailures = actions.fetchMany({
  endpoint: fetchManyEndpoint
});

export const resolveFailure = (id, note) =>
  createApiAction({
    type: additionalActionTypes.RESOLVE,
    method: 'POST',
    endpoint: `/submission-failures/${id}/resolve`,
    body: { note },
    meta: { id }
  });

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
