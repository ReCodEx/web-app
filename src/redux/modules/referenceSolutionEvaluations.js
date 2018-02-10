import { handleActions } from 'redux-actions';

import factory, { initialState } from '../helpers/resourceManager';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'referenceSolutionEvaluations';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: evaluationId =>
    `/reference-solutions/evaluation/${evaluationId}`
});

/**
 * Actions
 */

export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recodex/files/DOWNLOAD_EVALUATION_ARCHIVE',
  DOWNLOAD_SOLUTION_ARCHIVE: 'recodex/files/DOWNLOAD_SOLUTION_ARCHIVE'
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
  fetch: null,
  endpoint: id => `/reference-solutions/evaluation/${id}/download-result`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip'
});

export const downloadSolutionArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_SOLUTION_ARCHIVE,
  fetch: null,
  endpoint: id => `/reference-solutions/${id}/download-solution`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip'
});

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);
export default reducer;
