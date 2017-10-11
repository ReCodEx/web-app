import { handleActions } from 'redux-actions';
import { saveAs } from 'file-saver';

import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

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

const reducer = handleActions(reduceActions, initialState);
export default reducer;
