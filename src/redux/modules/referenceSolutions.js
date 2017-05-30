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

export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recodex/files/DOWNLOAD_EVALUATION_ARCHIVE'
};

export const fetchReferenceSolutions = actions.fetchResource;
export const fetchReferenceSolutionsIfNeeded = actions.fetchOneIfNeeded; // fetch solutions for one exercise

export const evaluateReferenceSolution = solutionId =>
  createApiAction({
    type: 'SUBMIT_REFERENCE_SOLUTION',
    endpoint: `/reference-solutions/${solutionId}/evaluate`,
    method: 'POST',
    meta: { solutionId }
  });

export const fetchReferenceEvaluations = solutionId =>
  createApiAction({
    type: additionalActionTypes.FETCH_REFERENCE_EVALUATIONS,
    endpoint: `/reference-solutions/${solutionId}/evaluations`,
    method: 'GET',
    meta: { solutionId }
  });

export const downloadEvaluationArchive = evaluationId => (dispatch, getState) =>
  dispatch(
    createApiAction({
      type: additionalActionTypes.DOWNLOAD_EVALUATION_ARCHIVE,
      method: 'GET',
      endpoint: `/reference-solutions/evaluation/${evaluationId}/download-result`,
      doNotProcess: true // the response is not (does not have to be) a JSON
    })
  )
    .then(({ value }) => value.blob())
    .then(blob => {
      saveAs(blob, evaluationId + '.zip');
      return Promise.resolve();
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
