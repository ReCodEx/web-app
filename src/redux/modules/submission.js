import { fromJS, Map } from 'immutable';
import { handleActions, createAction } from 'redux-actions';

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
  ADD_FILE: 'recodex/submission/ADD_FILE',
  REMOVE_FILE: 'recodex/submission/REMOVE_FILE',
  RETURN_FILE: 'recodex/submission/RETURN_FILE',
  REMOVE_FAILED_FILE: 'recodex/submission/REMOVE_FAILED_FILE',
  MARK_FILE_UPLOADED: 'recodex/submission/MARK_FILE_UPLOADED',
  MARK_FILE_FAILED: 'recodex/submission/MARK_FILE_FAILED',
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
  dispatch => {
    dispatch(addFile(file));
    // @todo upload the file
    setTimeout(function() {
      if (Math.random() > 0.5) {
        dispatch(uploadSuccessful(file));
      } else {
        dispatch(uploadFailed(file));
      }
    }, 200 + Math.random()*1000);
  };

export const addFile = createAction(actionTypes.ADD_FILE);
export const removeFile = createAction(actionTypes.REMOVE_FILE);
export const returnFile = createAction(actionTypes.RETURN_FILE);
export const removeFailedFile = createAction(actionTypes.REMOVE_FAILED_FILE);
export const uploadSuccessful = createAction(actionTypes.MARK_FILE_UPLOADED);
export const uploadFailed = createAction(actionTypes.MARK_FILE_FAILED);

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

  [actionTypes.ADD_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploading' ], list => list.push(payload))
      .updateIn([ 'files', 'failed' ], list => list.filter(item => item !== payload)),

  [actionTypes.REMOVE_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploaded' ], list => list.filter(item => item !== payload))
      .updateIn([ 'files', 'removed' ], list => list.push(payload)),

  [actionTypes.RETURN_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'removed' ], list => list.filter(item => item !== payload))
      .updateIn([ 'files', 'uploaded' ], list => list.push(payload)),

  [actionTypes.REMOVE_FAILED_FILE]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'failed' ], list => list.filter(item => item !== payload)),

  [actionTypes.MARK_FILE_UPLOADED]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploading' ], list => list.filter(item => item !== payload))
      .updateIn([ 'files', 'uploaded' ], list => list.push(payload)),

  [actionTypes.MARK_FILE_FAILED]: (state, { payload }) =>
    state
      .updateIn([ 'files', 'uploading' ], list => list.filter(item => item !== payload))
      .updateIn([ 'files', 'failed' ], list => list.push(payload))

}, initialState);

export default reducer;
