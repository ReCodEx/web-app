import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';

const resourceName = 'pipelineFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/pipelineFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/pipelineFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/pipelineFiles/ADD_FILES_FULFILLED',
  ADD_FILES_REJECTED: 'recodex/pipelineFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recodex/pipelineFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recodex/pipelineFiles/REMOVE_FILE_FULFILLED',
};

export const fetchExerciseFilesForPipeline = pipelineId =>
  actions.fetchMany({
    endpoint: `/pipelines/${pipelineId}/exercise-files`,
  });

export const addPipelineFiles = (pipelineId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/pipelines/${pipelineId}/exercise-files`,
    method: 'POST',
    body: { files: files.map(({ id }) => id) },
    meta: { pipelineId },
  });

export const removePipelineFile = (pipelineId, fileId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/pipelines/${pipelineId}/exercise-files/${fileId}`,
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
