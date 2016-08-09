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
  messages: []
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

export const init = createAction(actionTypes.INIT, (webSocketChannelId, expectedTasksCount) => ({ webSocketChannelId, expectedTasksCount }));
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
    .update('isFinished', () => willBeFinishedAfterIncrementing(state));

export default handleActions({

  [actionTypes.INIT]: (state, { payload: { webSocketChannelId, expectedTasksCount } }) =>
    initialState
      .update('webSocketChannelId', () => webSocketChannelId)
      .update('expectedTasksCount', () => expectedTasksCount),

  [submissionActionTypes.SUBMIT_FULFILLED]: (state, { payload }) =>
    initialState
      .update('webSocketChannelId', () => payload.webSocketChannel.id)
      .update('expectedTasksCount', () => payload.webSocketChannel.expectedTasksCount),

  [actionTypes.COMPLETED_TASK]: (state, action) => increment(state, 'completed'),
  [actionTypes.SKIPPED_TASK]: (state, action) => increment(state, 'skipped', false),
  [actionTypes.FAILED_TASK]: (state, action) => increment(state, 'failed', false),

  [actionTypes.ADD_MESSAGE]: (state, { payload }) =>
    state.update('messages', messages => messages.push(payload)),

  [actionTypes.FINISH]: state => state.set('isFinished', true)

}, initialState);
