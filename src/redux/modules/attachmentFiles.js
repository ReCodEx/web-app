import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'attachmentExerciseFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/attachmentExerciseFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/attachmentExerciseFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/attachmentExerciseFiles/ADD_FILES_FULFILLED',
  ADD_FILES_FAILED: 'recodex/attachmentExerciseFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recodex/attachmentExerciseFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recodex/attachmentExerciseFiles/REMOVE_FILE_FULFILLED'
};

export const fetchAttachmentExerciseFiles = exerciseId =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/attachment-files`
  });

export const addAttachmentExerciseFiles = (exerciseId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/exercises/${exerciseId}/attachment-files`,
    method: 'POST',
    body: {
      files: files.map(uploaded => uploaded.file.id)
    },
    meta: {
      exerciseId,
      files: files.map(uploaded => ({
        tmpId: Math.random().toString(),
        file: uploaded.file
      }))
    },
    uploadFiles: true
  });

export const removeAttachmentExerciseFile = (exerciseId, fileId) =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/exercises/${exerciseId}/attachment-files/${fileId}`,
    method: 'DELETE',
    meta: { exerciseId, fileId }
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ADD_FILES_FULFILLED]: (state, { payload, meta: { files } }) =>
      payload.reduce(
        (state, data) =>
          state.setIn(
            ['resources', data.id],
            createRecord({ data, state: resourceStatus.FULFILLED })
          ),
        state
      ),
    [actionTypes.REMOVE_FILE_FULFILLED]: (
      state,
      { payload, meta: { fileId } }
    ) => state.deleteIn(['resources', fileId])
  }),
  initialState
);

export default reducer;
