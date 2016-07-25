import { fromJS, Map } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { apiCall } from '../api';

export const submissionStatus = {
  NONE: 'NONE',
  CREATING: 'CREATING',
  SENDING: 'SENDING',
  PROCESSING: 'PROCESSING',
  FINISHED: 'FINISHED'
};

export const actionTypes = {
  INIT: 'recodex/submission/INIT',
  CHANGE_NOTE: 'recodex/submission/CHANGE_NOTE',
  UPLOAD: 'recodex/submission/UPLOAD',
  UPLOAD_PENDING: 'recodex/submission/UPLOAD_PENDING',
  UPLOAD_FULFILLED: 'recodex/submission/UPLOAD_FULFILLED',
  UPLOAD_FAILED: 'recodex/submission/UPLOAD_REJECTED',
  REMOVE_FILE: 'recodex/submission/REMOVE_FILE',
  RETURN_FILE: 'recodex/submission/RETURN_FILE',
  REMOVE_FAILED_FILE: 'recodex/submission/REMOVE_FAILED_FILE',
  START_PROCESSING: 'recodex/submission/START_PROCESSING',
};

export const initialState = fromJS({
  userId: null,
  assignmentId: null,
  submittedOn: null,
  note: '',
  files: {
    uploading: [],
    failed: [],
    removed: [],
    uploaded: []
  },
  status: submissionStatus.NONE,
  warningMsg: null
});

/**
 * Actions
 */

export const init = createAction(
  actionTypes.INIT,
  (userId, assignmentId) => ({ userId, assignmentId })
);

export const changeNote = createAction(actionTypes.CHANGE_NOTE);

export const uploadFile = file =>
  apiCall({
    type: actionTypes.UPLOAD,
    method: 'POST',
    endpoint: '/uploaded-files/upload',
    body: { [file.name]: file },
    meta: file.name
  });

const wrapWithName = file => ({ [file.name]: file });
export const addFile = createAction(actionTypes.UPLOAD_PENDING, wrapWithName);
export const removeFile = createAction(actionTypes.REMOVE_FILE);
export const returnFile = createAction(actionTypes.RETURN_FILE);
export const removeFailedFile = createAction(actionTypes.REMOVE_FAILED_FILE);
export const uploadSuccessful = createAction(actionTypes.UPLOAD_FULFILLED);
export const uploadFailed = createAction(actionTypes.UPLOAD_FAILED, wrapWithName, file => file.name);

export const submitSolution = () =>
  dispatch =>
    createAction(actionTypes.START_PROCESSING);

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions({
  [actionTypes.INIT]: (state, { payload: { userId, assignmentId } }) =>
    initialState
      .set('userId', userId)
      .set('assignmentId', assignmentId)
      .set('status', submissionStatus.CREATING),

  [actionTypes.CHANGE_NOTE]: (state, { payload }) =>
    state.set('note', payload),

  [actionTypes.UPLOAD_PENDING]: (state, { payload }) => {
    const fileName = Object.keys(payload).pop();
    return state
            .updateIn([ 'files', 'uploading' ], list => list.push({ name: fileName, file: payload[fileName] }))
            .updateIn([ 'files', 'failed' ], list => list.filter(item => item.name !== payload.name));
  },

  [actionTypes.REMOVE_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploaded' ], list => list.filter(item => item.name !== payload.name))
      .updateIn([ 'files', 'removed' ], list => list.push(payload)),

  [actionTypes.RETURN_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'removed' ], list => list.filter(item => item.name !== payload.name))
      .updateIn([ 'files', 'uploaded' ], list => list.push(payload)),

  [actionTypes.REMOVE_FAILED_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'failed' ], list => list.filter(item => item.name !== payload.name)),

  [actionTypes.UPLOAD_FULFILLED]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploading' ], list => list.filter(item => item.name !== payload.name))
      .updateIn([ 'files', 'uploaded' ], list => list.push({ name: payload.name, file: payload })),

  [actionTypes.UPLOAD_FAILED]: (state, { meta }) => {
    const file = state.getIn([ 'files', 'uploading' ]).find(item => item.name = meta);
    return state
      .updateIn([ 'files', 'uploading' ], list => list.filter(item => item.name !== meta))
      .updateIn([ 'files', 'failed' ], list => list.push(file));
  }

}, initialState);

export default reducer;
