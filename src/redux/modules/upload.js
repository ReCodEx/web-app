import { fromJS } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypes = {
  INIT: 'recodex/upload/INIT',
  UPLOAD: 'recodex/upload/UPLOAD',
  UPLOAD_PENDING: 'recodex/upload/UPLOAD_PENDING',
  UPLOAD_FULFILLED: 'recodex/upload/UPLOAD_FULFILLED',
  UPLOAD_FAILED: 'recodex/upload/UPLOAD_REJECTED',
  REMOVE_FILE: 'recodex/upload/REMOVE_FILE',
  RETURN_FILE: 'recodex/upload/RETURN_FILE',
  REMOVE_FAILED_FILE: 'recodex/upload/REMOVE_FAILED_FILE'
};

export const initialState = fromJS({});

export const uploadFile = (id, file, endpoint = '/uploaded-files') =>
  createApiAction({
    type: actionTypes.UPLOAD,
    method: 'POST',
    endpoint,
    body: { [file.name]: file },
    meta: { id, fileName: file.name },
    uploadFiles: true
  });

const wrapWithName = (id, file) => ({ [file.name]: file });
export const init = createAction(actionTypes.INIT, id => id);
export const reset = init;
export const addFile = createAction(
  actionTypes.UPLOAD_PENDING,
  wrapWithName,
  (id, file) => ({ id, fileName: file.name })
);
export const removeFile = createAction(
  actionTypes.REMOVE_FILE,
  (id, payload) => payload,
  id => ({ id })
);
export const returnFile = createAction(
  actionTypes.RETURN_FILE,
  (id, payload) => payload,
  id => ({ id })
);
export const removeFailedFile = createAction(
  actionTypes.REMOVE_FAILED_FILE,
  (id, payload) => payload,
  id => ({ id })
);
export const uploadSuccessful = createAction(
  actionTypes.UPLOAD_FULFILLED,
  (id, payload) => payload,
  (id, file) => ({ id, fileName: file.name })
);
export const uploadFailed = createAction(
  actionTypes.UPLOAD_FAILED,
  wrapWithName,
  (id, file) => ({ id, fileName: file.name })
);

const reducer = handleActions(
  {
    [actionTypes.INIT]: (state, { payload: id }) =>
      state.set(
        id,
        fromJS({
          uploading: [],
          failed: [],
          removed: [],
          uploaded: []
        })
      ),

    [actionTypes.UPLOAD_PENDING]: (
      state,
      { payload, meta: { id, fileName } }
    ) =>
      state
        .updateIn([id, 'uploading'], list =>
          list.push({ name: fileName, file: payload[fileName] })
        )
        .updateIn([id, 'failed'], list =>
          list.filter(item => item.name !== fileName)
        )
        .updateIn([id, 'removed'], list =>
          list.filter(item => item.name !== fileName)
        )
        .updateIn([id, 'uploaded'], list =>
          list.filter(item => item.name !== fileName)
        ),

    [actionTypes.UPLOAD_FULFILLED]: (
      state,
      { payload, meta: { id, fileName } }
    ) =>
      state
        .updateIn([id, 'uploading'], list =>
          list.filter(item => item.name !== fileName)
        )
        .updateIn([id, 'uploaded'], list =>
          list.filter(item => item.name !== fileName)
        ) // overwrite file with the same name
        .updateIn([id, 'uploaded'], list =>
          list.push({ name: payload.name, file: payload })
        ),

    [actionTypes.UPLOAD_FAILED]: (state, { meta: { id, fileName } }) => {
      const file = state
        .getIn([id, 'uploading'])
        .find(item => item.name === fileName);
      return state
        .updateIn([id, 'uploading'], list =>
          list.filter(item => item.name !== fileName)
        )
        .updateIn([id, 'failed'], list => list.push(file));
    },

    [actionTypes.REMOVE_FILE]: (state, { payload, meta: { id } }) =>
      state
        .updateIn([id, 'uploaded'], list =>
          list.filter(item => item.name !== payload.name)
        )
        .updateIn([id, 'removed'], list => list.push(payload)),

    [actionTypes.RETURN_FILE]: (state, { payload, meta: { id } }) =>
      state
        .updateIn([id, 'removed'], list =>
          list.filter(item => item.name !== payload.name)
        )
        .updateIn([id, 'uploaded'], list => list.push(payload)),

    [actionTypes.REMOVE_FAILED_FILE]: (state, { payload, meta: { id } }) =>
      state.updateIn([id, 'failed'], list =>
        list.filter(item => item.name !== payload.name)
      )
  },
  initialState
);

export default reducer;
