import { fromJS } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';
import { actionTypes as uploadActionTypes } from './upload';

export const submissionStatus = {
  NONE: 'NONE',
  CREATING: 'CREATING',
  VALIDATING: 'VALIDATING',
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
  PRESUBMIT: 'recodex/submission/PRESUBMIT',
  PRESUBMIT_RESET: 'recodex/submission/PRESUBMIT_RESET',
  PRESUBMIT_PENDING: 'recodex/submission/PRESUBMIT_PENDING',
  PRESUBMIT_FULFILLED: 'recodex/submission/PRESUBMIT_FULFILLED',
  PRESUBMIT_REJECTED: 'recodex/submission/PRESUBMIT_REJECTED',
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
  warningMsg: null,
  presubmit: null // results of pre-submit check
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

const submit = (endpoint, submissionType = 'assignmentSolution') => (
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
    body: submitBody,
    meta: { urlId: id, submissionType }
  });
};

export const submitAssignmentSolution = submit(
  id => `/exercise-assignments/${id}/submit`
);

export const submitReferenceSolution = submit(
  id => `/reference-solutions/exercise/${id}/submit`,
  'referenceSolution'
);

export const finishProcessing = createAction(actionTypes.PROCESSING_FINISHED);

/**
 * Presubmit endpoints
 */

const presubmit = endpoint => (id, files) => {
  if (!files || !files.length) {
    return createAction(
      actionTypes.PRESUBMIT_RESET
    )(/* immediate instantiation without payload */);
  }

  var submitBody = {
    files: files.map(file => file.id)
  };
  return createApiAction({
    type: actionTypes.PRESUBMIT,
    method: 'POST',
    endpoint: endpoint(id),
    body: submitBody,
    meta: { urlId: id }
  });
};

export const presubmitAssignmentSolution = presubmit(
  id => `/exercise-assignments/${id}/pre-submit`
);

export const presubmitReferenceSolution = presubmit(
  id => `/reference-solutions/exercise/${id}/pre-submit`
);

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  {
    [actionTypes.INIT]: (state, { payload: { userId, id } }) =>
      initialState
        .set('userId', userId)
        .set('id', id)
        .set('status', submissionStatus.CREATING)
        .set('presubmit', null),

    [actionTypes.CHANGE_NOTE]: (state, { payload }) =>
      state.set('note', payload).set('status', submissionStatus.CREATING),

    [actionTypes.SUBMIT_PENDING]: state =>
      state.set('status', submissionStatus.SENDING),

    [actionTypes.SUBMIT_REJECTED]: state =>
      state.set('status', submissionStatus.FAILED),

    [actionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload: { submission, webSocketChannel } }
    ) =>
      submission && webSocketChannel
        ? state
            .set('submissionId', submission.id)
            .set('monitor', {
              url: webSocketChannel.monitorUrl,
              id: webSocketChannel.id
            })
            .set('status', submissionStatus.PROCESSING)
        : state.set('status', submissionStatus.PROCESSING),

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
      state.set('status', submissionStatus.FAILED),

    // Presubmit check operations
    [actionTypes.PRESUBMIT_RESET]: state =>
      state.set('presubmit', null).set('status', submissionStatus.CREATING),

    [actionTypes.PRESUBMIT_PENDING]: state =>
      state.set('presubmit', null).set('status', submissionStatus.VALIDATING),

    [actionTypes.PRESUBMIT_REJECTED]: state =>
      state.set('status', submissionStatus.FAILED),

    [actionTypes.PRESUBMIT_FULFILLED]: (state, { payload }) =>
      state
        .set('presubmit', fromJS(payload))
        .set('status', submissionStatus.CREATING)
  },
  initialState
);

export default reducer;
