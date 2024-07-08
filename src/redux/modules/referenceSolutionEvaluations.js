import { handleActions } from 'redux-actions';

import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { downloadHelper } from '../helpers/api/download.js';
import { actionTypes as additionalSubmissionActionTypes } from './submission.js';
import { arrayToObject } from '../../helpers/common.js';

const resourceName = 'referenceSolutionEvaluations';
const { actionTypes, actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: evaluationId => `/reference-solutions/submission/${evaluationId}`,
});

/**
 * Actions
 */

export { actionTypes };
export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recodex/files/DOWNLOAD_EVALUATION_ARCHIVE',
  DOWNLOAD_SOLUTION_ARCHIVE: 'recodex/files/DOWNLOAD_SOLUTION_ARCHIVE',
};

export const fetchReferenceSolutionEvaluation = actions.fetchResource;
export const fetchReferenceSolutionEvaluationIfNeeded = actions.fetchOneIfNeeded;
export const deleteReferenceSolutionEvaluation = (solutionId, evaluationId) => {
  const action = actions.removeResource(evaluationId);
  action.request.meta.solutionId = solutionId;
  return action;
};

export const fetchManyEndpoint = id => `/reference-solutions/${id}/submissions`;

export const fetchReferenceSolutionEvaluationsForSolution = solutionId =>
  actions.fetchMany({
    endpoint: fetchManyEndpoint(solutionId),
  });

export const downloadEvaluationArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_EVALUATION_ARCHIVE,
  fetch: null,
  endpoint: id => `/reference-solutions/submission/${id}/download-result`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip',
});

export const downloadSolutionArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_SOLUTION_ARCHIVE,
  fetch: null,
  endpoint: id => `/reference-solutions/${id}/download-solution`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip',
});

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalSubmissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload: { submissions }, meta: { submissionType } }
    ) =>
      submissionType === 'referenceSolution' && submissions
        ? state.mergeIn(
            ['resources'],
            arrayToObject(
              submissions,
              ({ submission }) => submission.id,
              ({ submission }) =>
                createRecord({
                  state: resourceStatus.FULFILLED,
                  data: submission,
                })
            )
          )
        : state,
  }),
  initialState
);
export default reducer;
