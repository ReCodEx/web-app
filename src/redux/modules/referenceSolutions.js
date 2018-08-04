import { handleActions } from 'redux-actions';

import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as additionalSubmissionActionTypes } from './submission';
import { actionTypes as referenceSolutionEvaluationsActionTypes } from './referenceSolutionEvaluations';

const resourceName = 'referenceSolutions';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: solutionId => `/reference-solutions/${solutionId}`
});

/**
 * Actions
 */

export const additionalActionTypes = {
  RESUBMIT: 'recodex/referenceSolutions/RESUBMIT',
  FETCHALL: 'recodex/referenceSolutions/FETCHALL',
  FETCHALL_FULFILLED: 'recodex/referenceSolutions/FETCHALL_FULFILLED'
};

export const fetchReferenceSolution = actions.fetchResource;
export const fetchReferenceSolutionIfNeeded = actions.fetchOneIfNeeded;
export const deleteReferenceSolution = actions.removeResource;

export const fetchReferenceSolutions = exerciseId =>
  createApiAction({
    type: additionalActionTypes.FETCHALL,
    endpoint: `/reference-solutions/exercise/${exerciseId}`,
    method: 'GET',
    meta: { exerciseId }
  });

export const resubmitReferenceSolution = (
  solutionId,
  progressObserverId = null,
  isDebug = false
) =>
  createApiAction({
    type: additionalSubmissionActionTypes.SUBMIT,
    endpoint: `/reference-solutions/${solutionId}/resubmit`,
    method: 'POST',
    body: { debug: isDebug },
    meta: {
      solutionId,
      submissionType: 'referenceSolution',
      progressObserverId
    }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalSubmissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload: { referenceSolution }, meta: { submissionType } }
    ) =>
      submissionType === 'referenceSolution' &&
      referenceSolution &&
      referenceSolution.id
        ? state.setIn(
            ['resources', referenceSolution.id],
            createRecord({
              state: resourceStatus.FULFILLED,
              data: referenceSolution
            })
          )
        : state,

    [additionalActionTypes.FETCHALL_FULFILLED]: (state, { payload }) =>
      payload.reduce(
        (state, data) =>
          state.setIn(
            ['resources', data.id],
            createRecord({
              data,
              state: resourceStatus.FULFILLED
            })
          ),
        state
      ),

    [referenceSolutionEvaluationsActionTypes.REMOVE_FULFILLED]: (
      state,
      { meta: { solutionId, id: evaluationId } }
    ) =>
      solutionId && evaluationId
        ? state.updateIn(
            ['resources', solutionId, 'data', 'submissions'],
            submissions =>
              submissions.filter(submission => submission !== evaluationId)
          )
        : state
  }),
  initialState
);

export default reducer;
