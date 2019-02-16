import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { fromJS } from 'immutable';

const resourceName = 'submissionFailures';
var { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  RESOLVE: 'recodex/submissionFailures/RESOLVE',
  RESOLVE_FULFILLED: 'recodex/submissionFailures/RESOLVE_FULFILLED',
};

/**
 * Actions
 */
export const fetchManyEndpoint = '/submission-failures';

export const fetchAllFailures = actions.fetchMany({
  endpoint: fetchManyEndpoint,
});

export const resolveFailure = (id, data) =>
  createApiAction({
    type: additionalActionTypes.RESOLVE,
    method: 'POST',
    endpoint: `/submission-failures/${id}/resolve`,
    body: { ...data },
    meta: { id },
  });

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.RESOLVE_FULFILLED]: (state, { meta: { id }, payload }) =>
      state.setIn(['resources', id, 'data'], fromJS(payload)),
  }),
  initialState
);

export default reducer;
