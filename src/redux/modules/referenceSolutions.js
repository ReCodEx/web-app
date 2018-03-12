import { handleActions } from 'redux-actions';
import { List, fromJS } from 'immutable';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as additionalSubmissionActionTypes } from './submission';

const resourceName = 'referenceSolutions';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: exerciseId =>
    `/reference-solutions/exercise/${exerciseId}`
});

/**
 * Actions
 */

export const additionalActionTypes = {
  RESUBMIT: 'recodex/referenceSolutions/RESUBMIT',
  REMOVE: 'recodex/referenceSolutions/REMOVE',
  REMOVE_PENDING: 'recodex/referenceSolutions/REMOVE_PENDING',
  REMOVE_FULFILLED: 'recodex/referenceSolutions/REMOVE_FULFILLED',
  REMOVE_REJECTED: 'recodex/referenceSolutions/REMOVE_REJECTED'
};

export const fetchReferenceSolutions = actions.fetchResource;
export const fetchReferenceSolutionsIfNeeded = actions.fetchOneIfNeeded; // fetch solutions for one exercise

export const resubmitReferenceSolution = (solutionId, isDebug = false) =>
  createApiAction({
    type: additionalActionTypes.RESUBMIT,
    endpoint: `/reference-solutions/${solutionId}/resubmit`,
    method: 'POST',
    body: { debug: isDebug },
    meta: { solutionId }
  });

export const deleteReferenceSolution = (exerciseId, solutionId) =>
  createApiAction({
    type: additionalActionTypes.REMOVE,
    endpoint: `/reference-solutions/${solutionId}`,
    method: 'DELETE',
    meta: { exerciseId, solutionId }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalSubmissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload: { referenceSolution }, meta: { urlId, submissionType } }
    ) =>
      submissionType === 'referenceSolution'
        ? state.updateIn(['resources', urlId, 'data'], data => {
            if (!data) {
              data = List();
            }
            return data.push(fromJS(referenceSolution));
          })
        : state,
    [additionalActionTypes.REMOVE_FULFILLED]: (
      state,
      { payload, meta: { exerciseId, solutionId } }
    ) =>
      state.updateIn(['resources', exerciseId, 'data'], solutions =>
        solutions.filter(solution => solution.toJS().id !== solutionId)
      )
  }),
  initialState
);

export default reducer;
