import { fromJS } from 'immutable';
import { handleActions, createAction } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';
import { actionTypes as uploadActionTypes } from './upload';

export const referenceSolutionStatus = {
  NONE: 'NONE',
  CREATING: 'CREATING',
  SENDING: 'SENDING',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
  FINISHED: 'FINISHED'
};

export const actionTypes = {
  INIT: 'recodex/referenceSolution/INIT',
  CANCEL: 'recodex/referenceSolution/CANCEL',
  SUBMIT: 'recodex/referenceSolution/SUBMIT',
  SUBMIT_PENDING: 'recodex/referenceSolution/SUBMIT_PENDING',
  SUBMIT_FULFILLED: 'recodex/referenceSolution/SUBMIT_FULFILLED',
  SUBMIT_REJECTED: 'recodex/referenceSolution/SUBMIT_REJECTED',
  PROCESSING_FINISHED: 'recodex/referenceSolution/PROCESSING_FINISHED'
};

export const initialState = fromJS({
  exerciseId: null,
  referenceSolutionId: null,
  userId: null,
  submittedOn: null,
  note: '',
  status: referenceSolutionStatus.NONE,
  warningMsg: null
});

/**
 * Actions
 */

export const init = createAction(actionTypes.INIT, (userId, exerciseId) => ({
  userId,
  exerciseId
}));

export const createReferenceSolution = (
  userId,
  exerciseId,
  note,
  files,
  runtimeId
) =>
  createApiAction({
    type: actionTypes.SUBMIT,
    method: 'POST',
    endpoint: `/reference-solutions/exercise/${exerciseId}`,
    body: { userId, files: files.map(file => file.id), note, runtimeId }
  });

export const finishProcessing = createAction(actionTypes.PROCESSING_FINISHED);

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  {
    [actionTypes.INIT]: (state, { payload: { userId, exerciseId } }) =>
      initialState
        .set('userId', userId)
        .set('exerciseId', exerciseId)
        .set('status', referenceSolutionStatus.CREATING),

    [actionTypes.SUBMIT_PENDING]: state =>
      state.set('status', referenceSolutionStatus.SENDING),

    [actionTypes.SUBMIT_REJECTED]: state =>
      state.set('status', referenceSolutionStatus.FAILED),

    [actionTypes.SUBMIT_FULFILLED]: (state, { payload }) =>
      state
        .set('referenceSolutionId', payload.id)
        .set('status', referenceSolutionStatus.PROCESSING),

    [actionTypes.CANCEL]: (state, { payload }) => initialState,

    [actionTypes.PROCESSING_FINISHED]: (state, { payload }) =>
      state.set('status', referenceSolutionStatus.FINISHED),

    // wait until all the files are uploaded successfully:
    [uploadActionTypes.UPLOAD_PENDING]: (
      state,
      { payload, meta: { fileName } }
    ) => state.set('status', referenceSolutionStatus.CREATING),

    [uploadActionTypes.REMOVE_FILE]: (state, { payload }) =>
      state.set('status', referenceSolutionStatus.CREATING),

    [uploadActionTypes.RETURN_FILE]: (state, { payload }) =>
      state.set('status', referenceSolutionStatus.CREATING),

    [uploadActionTypes.REMOVE_FAILED_FILE]: (state, { payload }) =>
      state.set('status', referenceSolutionStatus.CREATING),

    [uploadActionTypes.UPLOAD_FAILED]: (state, { meta: { fileName } }) =>
      state.set('status', referenceSolutionStatus.FAILED)
  },
  initialState
);

export default reducer;
