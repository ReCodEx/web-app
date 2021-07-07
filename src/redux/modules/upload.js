import { fromJS } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypes = {
  INIT: 'recodex/upload/INIT',
  START_UPLOAD: 'recodex/upload/START_UPLOAD',
  START_UPLOAD_PENDING: 'recodex/upload/START_UPLOAD_PENDING',
  START_UPLOAD_FULFILLED: 'recodex/upload/START_UPLOAD_FULFILLED',
  START_UPLOAD_REJECTED: 'recodex/upload/START_UPLOAD_REJECTED',
  UPLOAD_CHUNK: 'recodex/upload/UPLOAD_CHUNK',
  UPLOAD_CHUNK_PENDING: 'recodex/upload/UPLOAD_CHUNK_PENDING',
  UPLOAD_CHUNK_FULFILLED: 'recodex/upload/UPLOAD_CHUNK_FULFILLED',
  UPLOAD_CHUNK_REJECTED: 'recodex/upload/UPLOAD_CHUNK_REJECTED',
  COMPLETE_UPLOAD: 'recodex/upload/COMPLETE_UPLOAD',
  COMPLETE_UPLOAD_PENDING: 'recodex/upload/COMPLETE_UPLOAD_PENDING',
  COMPLETE_UPLOAD_FULFILLED: 'recodex/upload/COMPLETE_UPLOAD_FULFILLED',
  COMPLETE_UPLOAD_REJECTED: 'recodex/upload/COMPLETE_UPLOAD_REJECTED',
  CANCEL_UPLOAD: 'recodex/upload/CANCEL_UPLOAD',
  CANCEL_UPLOAD_PENDING: 'recodex/upload/CANCEL_UPLOAD_PENDING',
  CANCEL_UPLOAD_FULFILLED: 'recodex/upload/CANCEL_UPLOAD_FULFILLED',
  CANCEL_UPLOAD_REJECTED: 'recodex/upload/CANCEL_UPLOAD_REJECTED',
  FINALIZE_UPLOAD: 'recodex/upload/FINALIZE_UPLOAD',
  MANUALLY_FAIL_UPLOAD: 'recodex/upload/MANUALLY_FAIL_UPLOAD',
  REQUEST_CANCEL: 'recodex/upload/REQUEST_CANCEL',
  REMOVE_FILE: 'recodex/upload/REMOVE_FILE',
  RESTORE_REMOVED_FILE: 'recodex/upload/RESTORE_REMOVED_FILE',
  REMOVE_FAILED_FILE: 'recodex/upload/REMOVE_FAILED_FILE',
  FETCH_DIGEST: 'recodex/upload/FETCH_DIGEST',
};

export const initialState = fromJS({});

export const startUploadFile = (containerId, file) =>
  createApiAction({
    type: actionTypes.START_UPLOAD,
    method: 'POST',
    endpoint: '/uploaded-files/partial',
    body: { name: file.name, size: file.size },
    meta: { containerId, file },
  });

export const uploadFileChunk = (containerId, partialFileId, file, offset, size) =>
  createApiAction({
    type: actionTypes.UPLOAD_CHUNK,
    method: 'PUT',
    endpoint: `/uploaded-files/partial/${partialFileId}?offset=${offset}`,
    body: file.slice(offset, offset + size),
    meta: { containerId, file },
  });

export const completeUploadFile = (containerId, partialFileId, file) =>
  createApiAction({
    type: actionTypes.COMPLETE_UPLOAD,
    method: 'POST',
    endpoint: `/uploaded-files/partial/${partialFileId}`,
    meta: { containerId, partialFileId, file },
  });

export const cancelUploadFile = (containerId, partialFileId, file, failWithError = null) =>
  createApiAction({
    type: actionTypes.CANCEL_UPLOAD,
    method: 'DELETE',
    endpoint: `/uploaded-files/partial/${partialFileId}`,
    meta: { containerId, partialFileId, file, failWithError },
  });

export const requestUploadCancel = createAction(actionTypes.REQUEST_CANCEL, (containerId, fileName) => ({
  containerId,
  fileName,
}));

export const finalizeUpload = createAction(actionTypes.FINALIZE_UPLOAD, (containerId, file) => ({
  containerId,
  file,
}));

export const manuallyFailUpload = createAction(actionTypes.MANUALLY_FAIL_UPLOAD, (containerId, file, message) => ({
  containerId,
  file,
  message,
}));

export const init = createAction(actionTypes.INIT, id => id);
export const reset = init;

const createFileAction = type =>
  createAction(type, (containerId, fileName) => ({
    containerId,
    fileName,
  }));

export const removeFile = createFileAction(actionTypes.REMOVE_FILE);
export const restoreRemovedFile = createFileAction(actionTypes.RESTORE_REMOVED_FILE);
export const removeFailedFile = createFileAction(actionTypes.REMOVE_FAILED_FILE);

export const fetchUploadFileDigest = id =>
  createApiAction({
    type: actionTypes.FETCH_DIGEST,
    method: 'GET',
    endpoint: `/uploaded-files/${id}/digest`,
  });

// testing functions TODO fix
export const testAddFile = createAction(
  actionTypes.START_UPLOAD_PENDING,
  () => {},
  (containerId, file) => ({
    containerId,
    file,
  })
);

const reducer = handleActions(
  {
    [actionTypes.INIT]: (state, { payload: id }) =>
      state.set(
        id,
        fromJS({
          uploading: {},
          failed: {},
          uploaded: {},
          removed: {},
        })
      ),

    // new

    // start upload
    [actionTypes.START_UPLOAD_PENDING]: (state, { meta: { containerId, file } }) =>
      state
        .setIn(
          [containerId, 'uploading', file.name],
          fromJS({
            file,
            partialFile: null,
            uploadedFile: null,
            cancelRequested: false,
            canceling: false,
            completing: false,
          })
        )
        .removeIn([containerId, 'failed', file.name])
        .removeIn([containerId, 'removed', file.name])
        .removeIn([containerId, 'uploaded', file.name]),

    [actionTypes.START_UPLOAD_FULFILLED]: (state, { payload, meta: { containerId, file } }) =>
      state.setIn([containerId, 'uploading', file.name, 'partialFile'], fromJS(payload)),

    [actionTypes.START_UPLOAD_REJECTED]: (state, { payload, meta: { containerId, file } }) =>
      state.removeIn([containerId, 'uploading', file.name]).setIn(
        [containerId, 'failed', file.name],
        fromJS({
          file,
          errorMessage: payload && payload.message,
        })
      ),

    // upload next chunk
    [actionTypes.UPLOAD_CHUNK_FULFILLED]: (state, { payload, meta: { containerId, file } }) =>
      state.setIn([containerId, 'uploading', file.name, 'partialFile'], fromJS(payload)),

    [actionTypes.UPLOAD_CHUNK_REJECTED]: (state, { payload, meta: { containerId, file } }) =>
      state.removeIn([containerId, 'uploading', file.name]).setIn(
        [containerId, 'failed', file.name],
        fromJS({
          file,
          errorMessage: payload && payload.message,
        })
      ),

    // complete upload (make the server assemble all the chunks)
    [actionTypes.COMPLETE_UPLOAD_PENDING]: (state, { meta: { containerId, file } }) =>
      state.setIn([containerId, 'uploading', file.name, 'completing'], true),

    [actionTypes.COMPLETE_UPLOAD_FULFILLED]: (state, { payload, meta: { containerId, file } }) =>
      state.setIn([containerId, 'uploading', file.name, 'uploadedFile'], fromJS(payload)),

    [actionTypes.COMPLETE_UPLOAD_REJECTED]: (state, { payload, meta: { containerId, file } }) =>
      state.removeIn([containerId, 'uploading', file.name]).setIn(
        [containerId, 'failed', file.name],
        fromJS({
          file,
          errorMessage: payload && payload.message,
        })
      ),

    // cancel upload (remove already uploaded chunks)
    [actionTypes.CANCEL_UPLOAD_PENDING]: (state, { meta: { containerId, file } }) =>
      state.setIn([containerId, 'uploading', file.name, 'canceling'], true),

    [actionTypes.CANCEL_UPLOAD_FULFILLED]: (state, { meta: { containerId, file, failWithError } }) =>
      (failWithError
        ? state.setIn(
            [containerId, 'failed', file.name],
            fromJS({
              file,
              errorMessage: failWithError,
            })
          )
        : state
      ).removeIn([containerId, 'uploading', file.name]),

    [actionTypes.CANCEL_UPLOAD_REJECTED]: (state, { meta: { containerId, file, failWithError } }) =>
      (failWithError
        ? state.setIn(
            [containerId, 'failed', file.name],
            fromJS({
              file,
              errorMessage: failWithError,
            })
          )
        : state
      ).removeIn([containerId, 'uploading', file.name]), // well, if the cancel fails, GC will deal with it later...

    [actionTypes.FINALIZE_UPLOAD]: (state, { payload: { containerId, file } }) =>
      state.hasIn([containerId, 'uploading', file.name, 'uploadedFile'])
        ? state
            .setIn(
              [containerId, 'uploaded', file.name],
              state.getIn([containerId, 'uploading', file.name, 'uploadedFile'])
            )
            .removeIn([containerId, 'uploading', file.name])
        : state,

    [actionTypes.MANUALLY_FAIL_UPLOAD]: (state, { payload: { containerId, file, message } }) =>
      state
        .removeIn([containerId, 'uploading', file.name])
        .removeIn([containerId, 'uploaded', file.name])
        .setIn(
          [containerId, 'failed', file.name],
          fromJS({
            file,
            errorMessage: message,
          })
        ),

    // other actions
    [actionTypes.REQUEST_CANCEL]: (state, { payload: { containerId, fileName } }) =>
      state.hasIn([containerId, 'uploading', fileName, 'cancelRequested'])
        ? state.setIn([containerId, 'uploading', fileName, 'cancelRequested'], true)
        : state,

    [actionTypes.REMOVE_FILE]: (state, { payload: { containerId, fileName } }) =>
      state.hasIn([containerId, 'uploaded', fileName])
        ? state
            .setIn([containerId, 'removed', fileName], state.getIn([containerId, 'uploaded', fileName]))
            .removeIn([containerId, 'uploaded', fileName])
        : state,

    [actionTypes.RESTORE_REMOVED_FILE]: (state, { payload: { containerId, fileName } }) =>
      state.hasIn([containerId, 'removed', fileName])
        ? state
            .setIn([containerId, 'uploaded', fileName], state.getIn([containerId, 'removed', fileName]))
            .removeIn([containerId, 'removed', fileName])
        : state,

    [actionTypes.REMOVE_FAILED_FILE]: (state, { payload: { containerId, fileName } }) =>
      state.removeIn([containerId, 'failed', fileName]),

    // old
    [actionTypes.UPLOAD_PENDING]: (state, { payload, meta: { id, fileName } }) =>
      state
        .updateIn([id, 'uploading'], list => list.push({ name: fileName, file: payload[fileName] }))
        .updateIn([id, 'failed'], list => list.filter(item => item.name !== fileName))
        .updateIn([id, 'removed'], list => list.filter(item => item.name !== fileName))
        .updateIn([id, 'uploaded'], list => list.filter(item => item.name !== fileName)),

    [actionTypes.UPLOAD_FULFILLED]: (state, { payload, meta: { id, fileName } }) =>
      state
        .updateIn([id, 'uploading'], list => list.filter(item => item.name !== fileName))
        .updateIn([id, 'uploaded'], list => list.filter(item => item.name !== fileName)) // overwrite file with the same name
        .updateIn([id, 'uploaded'], list => list.push({ name: payload.name, file: payload })),

    [actionTypes.UPLOAD_REJECTED]: (state, { meta: { id, fileName } }) => {
      const file = state.getIn([id, 'uploading']).find(item => item.name === fileName);
      return state
        .updateIn([id, 'uploading'], list => list.filter(item => item.name !== fileName))
        .updateIn([id, 'failed'], list => list.push(file));
    },
  },
  initialState
);

export default reducer;
