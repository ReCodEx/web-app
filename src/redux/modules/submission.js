import { fromJS } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';
import { actionTypes as uploadActionTypes } from './upload';

export const submissionStatus = {
  NONE: 'NONE',
  CREATING: 'CREATING',
  SENDING: 'SENDING',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
  FINISHED: 'FINISHED'
};

export const actionTypes = {
  INIT: 'recodex/submission/INIT',
  CANCEL: 'recodex/submission/CANCEL',
  CHANGE_NOTE: 'recodex/submission/CHANGE_NOTE',
  SUBMIT: 'recodex/submission/SUBMIT',
  SUBMIT_PENDING: 'recodex/submission/SUBMIT_PENDING',
  SUBMIT_FULFILLED: 'recodex/submission/SUBMIT_FULFILLED',
  SUBMIT_REJECTED: 'recodex/submission/SUBMIT_REJECTED',
  PROCESSING_FINISHED: 'recodex/submission/PROCESSING_FINISHED'
};

export const initialState = fromJS({
  submissionId: null,
  userId: null,
  id: null,
  submittedOn: null,
  note: '',
  monitor: null,
  status: submissionStatus.NONE,
  warningMsg: null
});

/**
 * Actions
 */

export const init = createAction(actionTypes.INIT, (userId, id) => ({
  userId,
  id
}));
export const cancel = createAction(actionTypes.CANCEL);

export const changeNote = createAction(actionTypes.CHANGE_NOTE);

const submit = endpoint => (
  userId,
  id,
  note,
  files,
  runtimeEnvironmentId = null
) => {
  var submitBody = {
    userId,
    files: files.map(file => file.id),
    note
  };
  if (runtimeEnvironmentId != null) {
    submitBody.runtimeEnvironmentId = runtimeEnvironmentId;
  }
  return createApiAction({
    type: actionTypes.SUBMIT,
    method: 'POST',
    endpoint: endpoint(id),
    body: submitBody
  });
};

export const submitAssignmentSolution = submit(
  id => `/exercise-assignments/${id}/submit`
);

export const createReferenceSolution = submit(
  id => `/reference-solutions/exercise/${id}`
);

export const finishProcessing = createAction(actionTypes.PROCESSING_FINISHED);

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  {
    [actionTypes.INIT]: (state, { payload: { userId, id } }) =>
      initialState
        .set('userId', userId)
        .set('id', id)
        .set('status', submissionStatus.CREATING),

    [actionTypes.CHANGE_NOTE]: (state, { payload }) =>
      state.set('note', payload).set('status', submissionStatus.CREATING),

    [actionTypes.SUBMIT_PENDING]: state =>
      state.set('status', submissionStatus.SENDING),

    [actionTypes.SUBMIT_REJECTED]: state =>
      state.set('status', submissionStatus.FAILED),

    [actionTypes.SUBMIT_FULFILLED]: (state, { payload }) =>
      state
        .set('submissionId', payload.submission.id)
        .set('monitor', {
          url: payload.webSocketChannel.monitorUrl,
          id: payload.webSocketChannel.id
        })
        .set('status', submissionStatus.PROCESSING),

    [actionTypes.CANCEL]: (state, { payload }) => initialState,

    [actionTypes.PROCESSING_FINISHED]: (state, { payload }) =>
      state.set('status', submissionStatus.FINISHED),

    // wait until all the files are uploaded successfully:
    [uploadActionTypes.UPLOAD_PENDING]: (
      state,
      { payload, meta: { fileName } }
    ) => state.set('status', submissionStatus.CREATING),

    [uploadActionTypes.REMOVE_FILE]: (state, { payload }) =>
      state.set('status', submissionStatus.CREATING),

    [uploadActionTypes.RETURN_FILE]: (state, { payload }) =>
      state.set('status', submissionStatus.CREATING),

    [uploadActionTypes.REMOVE_FAILED_FILE]: (state, { payload }) =>
      state.set('status', submissionStatus.CREATING),

    [uploadActionTypes.UPLOAD_FAILED]: (state, { meta: { fileName } }) =>
      state.set('status', submissionStatus.FAILED)
  },
  initialState
);

export default reducer;
