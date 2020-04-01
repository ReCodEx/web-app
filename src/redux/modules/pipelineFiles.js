import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'pipelineFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recovid/pipelineFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recovid/pipelineFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recovid/pipelineFiles/ADD_FILES_FULFILLED',
  ADD_FILES_REJECTED: 'recovid/pipelineFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recovid/pipelineFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recovid/pipelineFiles/REMOVE_FILE_FULFILLED',
};

export const fetchSupplementaryFilesForPipeline = pipelineId =>
  actions.fetchMany({
    endpoint: `/pipelines/${pipelineId}/supplementary-files`,
  });

export const addPipelineFiles = (pipelineId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/pipelines/${pipelineId}/supplementary-files`,
    method: 'POST',
    body: {
      files: files.map(uploaded => uploaded.file.id),
    },
    meta: {
      pipelineId,
      files: files.map(uploaded => ({
        tmpId: Math.random().toString(),
        file: uploaded.file,
      })),
    },
    uploadFiles: true,
  });

export const removePipelineFile = (pipelineId, fileId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/pipelines/${pipelineId}/supplementary-files/${fileId}`,
    method: 'DELETE',
    meta: { pipelineId, fileId },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ADD_FILES_FULFILLED]: (state, { payload, meta: { files } }) =>
      payload.reduce(
        (state, data) => state.setIn(['resources', data.id], createRecord({ data, state: resourceStatus.FULFILLED })),
        state
      ),

    [actionTypes.REMOVE_FILE_FULFILLED]: (state, { meta: { fileId } }) => state.deleteIn(['resources', fileId]),
  }),
  initialState
);

export default reducer;
