import { handleActions } from 'redux-actions';
import { saveAs } from 'file-saver';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'referenceSolutions';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: evaluationId =>
    `/reference-solutions/evaluation/${evaluationId}`
});

/**
 * Actions
 */

export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recodex/files/DOWNLOAD_EVALUATION_ARCHIVE'
};

export const fetchReferenceSolutionEvaluation = actions.fetchResource;
export const fetchReferenceSolutionEvaluationIfNeeded =
  actions.fetchOneIfNeeded;

export const fetchReferenceSolutionEvaluationsForSolution = solutionId =>
  actions.fetchMany({
    endpoint: `/reference-solutions/${solutionId}/evaluations`
  });

export const downloadEvaluationArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_EVALUATION_ARCHIVE,
  fetch: fetchReferenceSolutionEvaluationIfNeeded,
  endpoint: id => `/reference-solutions/evaluation/${id}/download-result`,
  fileNameSelector: (id, state) => `${id}.zip`
});

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);
export default reducer;
