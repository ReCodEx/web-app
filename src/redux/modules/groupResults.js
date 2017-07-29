import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware';

import factory, { initialState } from '../helpers/resourceManager';
import createRecord from '../helpers/resourceManager/recordFactory';
import { resourceStatus } from '../helpers/resourceManager/status';

const resourceName = 'groupResults';
const { reduceActions } = factory({
  resourceName
});

/**
 * Actions
 */
export const additionalActionTypes = {
  BEST_SUBMISSION: 'recodex/groupResults/BEST_SUBMISSION',
  BEST_SUBMISSION_PENDING: 'recodex/groupResults/BEST_SUBMISSION_PENDING',
  BEST_SUBMISSION_FULFILLED: 'recodex/groupResults/BEST_SUBMISSION_FULFILLED'
};

export const fetchBestSubmission = (userId, assignmentId) =>
  createApiAction({
    type: additionalActionTypes.BEST_SUBMISSION,
    endpoint: `/exercise-assignments/${assignmentId}/users/${userId}/best-submission`,
    method: 'GET',
    meta: { userId, assignmentId }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.BEST_SUBMISSION_PENDING]: (
      state,
      { payload, meta: { userId, assignmentId } }
    ) => state.setIn(['resources', assignmentId, userId], createRecord()),

    [additionalActionTypes.BEST_SUBMISSION_FULFILLED]: (
      state,
      { payload = {}, meta: { userId, assignmentId } }
    ) =>
      state
        .setIn(['resources', assignmentId, userId, 'data'], fromJS(payload))
        .setIn(
          ['resources', assignmentId, userId, 'state'],
          resourceStatus.FULFILLED
        )
  }),
  initialState
);

export default reducer;
