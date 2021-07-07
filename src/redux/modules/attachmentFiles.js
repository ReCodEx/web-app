import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'attachmentFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/attachmentFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/attachmentFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/attachmentFiles/ADD_FILES_FULFILLED',
  ADD_FILES_REJECTED: 'recodex/attachmentFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recodex/attachmentFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recodex/attachmentFiles/REMOVE_FILE_FULFILLED',
  DOWNLOAD_ATTACHMENT_ARCHIVE: 'recodex/attachmentFiles/DOWNLOAD_ATTACHMENT_ARCHIVE',
};

export const fetchAttachmentFiles = exerciseId =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/attachment-files`,
  });

export const addAttachmentFiles = (exerciseId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/exercises/${exerciseId}/attachment-files`,
    method: 'POST',
    body: { files: files.map(({ id }) => id) },
    meta: { exerciseId },
    uploadFiles: true,
  });

export const removeAttachmentFile = (exerciseId, fileId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/exercises/${exerciseId}/attachment-files/${fileId}`,
    method: 'DELETE',
    meta: { exerciseId, fileId },
  });

export const downloadAttachmentArchive = downloadHelper({
  actionType: actionTypes.DOWNLOAD_ATTACHMENT_ARCHIVE,
  fetch: null,
  endpoint: id => `/exercises/${id}/attachment-files/download-archive`,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip',
});

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ADD_FILES_FULFILLED]: (state, { payload }) =>
      payload.reduce(
        (state, data) => state.setIn(['resources', data.id], createRecord({ data, state: resourceStatus.FULFILLED })),
        state
      ),

    [actionTypes.REMOVE_FILE_FULFILLED]: (state, { meta: { fileId } }) => state.deleteIn(['resources', fileId]),
  }),
  initialState
);

export default reducer;
