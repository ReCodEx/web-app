import { handleActions } from 'redux-actions';
import { saveAs } from 'file-saver';
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

export const fetchReferenceSolutions = actions.fetchResource;
export const fetchReferenceSolutionsIfNeeded = actions.fetchOneIfNeeded; // fetch solutions for one exercise

export const evaluateReferenceSolution = (solutionId, isDebug = false) =>
  createApiAction({
    type: 'SUBMIT_REFERENCE_SOLUTION',
    endpoint: `/reference-solutions/${solutionId}/evaluate`,
    method: 'POST',
    body: { debug: isDebug },
    meta: { solutionId }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalSubmissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload, meta: { urlId, submissionType } }
    ) =>
      submissionType === 'referenceSolution'
        ? state.updateIn(['resources', urlId, 'data'], data => {
            if (!data) {
              data = List();
            }
            return data.push(fromJS(payload));
          })
        : state
  }),
  initialState
);

export default reducer;
