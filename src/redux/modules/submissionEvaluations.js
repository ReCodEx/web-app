import { handleActions } from 'redux-actions';

import factory, { initialState } from '../helpers/resourceManager';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'submissionEvaluations';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: evaluationId =>
    `/assignment-solutions/evaluation/${evaluationId}`
});

/**
 * Actions
 */

export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recodex/files/DOWNLOAD_EVALUATION_ARCHIVE'
};

export const fetchSubmissionEvaluation = actions.fetchResource;
export const fetchSubmissionEvaluationIfNeeded = actions.fetchOneIfNeeded;

export const fetchSubmissionEvaluationsForSolution = solutionId =>
  actions.fetchMany({
    endpoint: `/assignment-solutions/${solutionId}/evaluations`
  });

export const downloadEvaluationArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_EVALUATION_ARCHIVE,
  fetch: fetchSubmissionEvaluationIfNeeded,
  endpoint: id => `/assignment-solutions/evaluation/${id}/download-result`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip'
});

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);
export default reducer;
