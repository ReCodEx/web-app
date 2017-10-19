import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'supplementaryFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/supplementaryFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/supplementaryFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/supplementaryFiles/ADD_FILES_FULFILLED',
  ADD_FILES_FAILED: 'recodex/supplementaryFiles/ADD_FILES_REJECTED',
  REMOVE_FILE: 'recodex/supplementaryFiles/REMOVE_FILE',
  REMOVE_FILE_FULFILLED: 'recodex/supplementaryFiles/REMOVE_FILE_FULFILLED'
};

export const fetchSupplementaryFilesForExercise = exerciseId =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/supplementary-files`
  });

export const addSupplementaryFiles = (exerciseId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/exercises/${exerciseId}/supplementary-files`,
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
    }
  });

export const removeSupplementaryFile = fileId =>
  createApiAction({
    type: actionTypes.REMOVE_FILE,
    endpoint: `/uploaded-files/${fileId}`,
    method: 'DELETE',
    meta: { fileId }
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
