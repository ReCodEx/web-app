import { handleActions } from 'redux-actions';

import factory, { initialState, resourceStatus, createRecord } from '../helpers/resourceManager';
import { downloadHelper } from '../helpers/api/download';
import { actionTypes as additionalSubmissionActionTypes } from './submission';

const resourceName = 'submissionEvaluations';
const { actionTypes, actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: evaluationId => `/assignment-solutions/evaluation/${evaluationId}`,
});

/**
 * Actions
 */

export { actionTypes };
export const additionalActionTypes = {
  DOWNLOAD_EVALUATION_ARCHIVE: 'recovid/files/DOWNLOAD_EVALUATION_ARCHIVE',
  DOWNLOAD_SOLUTION_ARCHIVE: 'recovid/files/DOWNLOAD_SOLUTION_ARCHIVE',
};

export const fetchSubmissionEvaluation = actions.fetchResource;
export const fetchSubmissionEvaluationIfNeeded = actions.fetchOneIfNeeded;
export const deleteSubmissionEvaluation = (solutionId, evaluationId) => {
  const action = actions.removeResource(evaluationId);
  action.request.meta.solutionId = solutionId;
  return action;
};

export const fetchManyEndpoint = id => `/assignment-solutions/${id}/evaluations`;

export const fetchSubmissionEvaluationsForSolution = solutionId =>
  actions.fetchMany({
    endpoint: fetchManyEndpoint(solutionId),
  });

export const downloadEvaluationArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_EVALUATION_ARCHIVE,
  fetch: null,
  endpoint: id => `/assignment-solutions/evaluation/${id}/download-result`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip',
});

export const downloadSolutionArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_SOLUTION_ARCHIVE,
  fetch: null,
  endpoint: id => `/assignment-solutions/${id}/download-solution`,
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
      { payload: { submission }, meta: { submissionType } }
    ) =>
      submissionType === 'assignmentSolution' && submission && submission.id
        ? state.setIn(
            ['resources', submission.id],
            createRecord({
              state: resourceStatus.FULFILLED,
              data: submission,
            })
          )
        : state,

    [additionalActionTypes.DELETE_EVALUATION_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'state'], resourceStatus.DELETING),

    [additionalActionTypes.DELETE_EVALUATION_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'state'], resourceStatus.FULFILLED),

    [additionalActionTypes.DELETE_EVALUATION_FULFILLED]: (state, { meta: { id } }) =>
      state.update('resources', resources =>
        resources.map((item, itemId) =>
          item.get('data') !== null
            ? item.update('data', data =>
                itemId === id
                  ? data.set('accepted', true).set('accepted-pending', false)
                  : data.set('accepted', false).set('accepted-pending', false)
              )
            : item
        )
      ),
  }),
  initialState
);
export default reducer;
