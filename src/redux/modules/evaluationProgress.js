import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { actionTypes as submissionActionTypes } from './submission';

export const initialState = fromJS({
  webSocketChannelId: null,
  expectedTasksCount: 0,
  isFinished: false,
  soFarSoGood: true,
  progress: {
    total: 0,
    completed: 0,
    skipped: 0,
    failed: 0
  },
  messages: [],
  progressObserverId: null
});

/**
 * Actions
 */

export const actionTypes = {
  INIT: 'recodex/evaluationProgress/INIT',
  FINISH: 'recodex/evaluationProgress/FINISH',
  COMPLETED_TASK: 'recodex/evaluationProgress/COMPLETED_TASK',
  SKIPPED_TASK: 'recodex/evaluationProgress/SKIPPED_TASK',
  FAILED_TASK: 'recodex/evaluationProgress/FAILED_TASK',
  ADD_MESSAGE: 'recodex/evaluationProgress/ADD_MESSAGE'
};

export const init = createAction(
  actionTypes.INIT,
  (webSocketChannelId, expectedTasksCount) => ({
    webSocketChannelId,
    expectedTasksCount
  })
);
export const completedTask = createAction(actionTypes.COMPLETED_TASK);
export const skippedTask = createAction(actionTypes.SKIPPED_TASK);
export const failedTask = createAction(actionTypes.FAILED_TASK);
export const addMessage = createAction(actionTypes.ADD_MESSAGE);
export const finish = createAction(actionTypes.FINISH);

/**
 * Reducer
 */

const willBeFinishedAfterIncrementing = state =>
  state.get('expectedTasksCount') === state.getIn(['progress', 'total']) + 1;

const increment = (state, type, isOK = true) =>
  state
    .updateIn(['progress', 'total'], total => total + 1)
    .updateIn(['progress', type], val => val + 1)
    .update('soFarSoGood', soFarSoGood => soFarSoGood && isOK)
    .update(
      'isFinished',
      isFinished => isFinished || willBeFinishedAfterIncrementing(state)
    );

const pushMessage = (state, msg) =>
  msg ? state.update('messages', messages => messages.push(msg)) : state;

export default handleActions(
  {
    [actionTypes.INIT]: (
      state,
      { payload: { webSocketChannelId, expectedTasksCount } }
    ) =>
      webSocketChannelId
        ? initialState
            .set('webSocketChannelId', webSocketChannelId)
            .set('expectedTasksCount', expectedTasksCount)
        : initialState.set('isFinished', true),

    [submissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload, meta: { submissionType, progressObserverId = null } }
    ) => {
      const webSocketChannel =
        submissionType === 'referenceSolution'
          ? payload.submissions &&
            payload.submissions.length > 0 &&
            payload.submissions[0].webSocketChannel
          : payload.webSocketChannel;

      const newState = webSocketChannel
        ? initialState
            .set('webSocketChannelId', webSocketChannel.id)
            .set('expectedTasksCount', webSocketChannel.expectedTasksCount)
        : initialState.set('isFinished', true);
      return newState.set('progressObserverId', progressObserverId);
    },

    [actionTypes.COMPLETED_TASK]: (state, { payload: msg }) =>
      pushMessage(increment(state, 'completed'), msg),

    [actionTypes.SKIPPED_TASK]: (state, { payload: msg }) =>
      pushMessage(increment(state, 'skipped', false), msg),

    [actionTypes.FAILED_TASK]: (state, { payload: msg }) =>
      pushMessage(increment(state, 'failed', false), msg),

    [actionTypes.ADD_MESSAGE]: (state, { payload: msg }) =>
      pushMessage(state, msg),

    [actionTypes.FINISH]: state =>
      state
        .set('isFinished', true)
        .set('expectedTasksCount', state.getIn(['progress', 'total'])) // maybe all the expected tasks did not arrive, stretch the progress to 100%
  },
  initialState
);
