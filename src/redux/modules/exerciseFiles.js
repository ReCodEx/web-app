import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { downloadHelper } from '../helpers/api/download.js';

const resourceName = 'exerciseFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/exerciseFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/exerciseFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/exerciseFiles/ADD_FILES_FULFILLED',
  ADD_FILES_REJECTED: 'recodex/exerciseFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recodex/exerciseFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recodex/exerciseFiles/REMOVE_FILE_FULFILLED',
  DOWNLOAD_EXERCISE_FILES_ARCHIVE: 'recodex/exerciseFiles/DOWNLOAD_EXERCISE_FILES_ARCHIVE',
};

export const fetchFilesForExerciseEndpoint = exerciseId => `/exercises/${exerciseId}/files`;

export const fetchFilesForExercise = exerciseId =>
  actions.fetchMany({
    endpoint: fetchFilesForExerciseEndpoint(exerciseId),
  });

export const addExerciseFiles = (exerciseId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/exercises/${exerciseId}/files`,
    method: 'POST',
    body: { files: files.map(({ id }) => id) },
    meta: { exerciseId },
  });

export const removeExerciseFile = (exerciseId, fileId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/exercises/${exerciseId}/files/${fileId}`,
    method: 'DELETE',
    meta: { exerciseId, fileId },
  });

export const downloadExerciseFilesArchive = downloadHelper({
  actionType: actionTypes.DOWNLOAD_EXERCISE_FILES_ARCHIVE,
  fetch: null,
  endpoint: id => `/exercises/${id}/files/download-archive`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip',
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
