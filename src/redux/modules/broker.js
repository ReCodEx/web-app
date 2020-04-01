import { handleActions } from 'redux-actions';
import { createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { fromJS } from 'immutable';

export const actionTypes = {
  BROKER_STATS_FETCH: 'recovid/broker/STATS_FETCH',
  BROKER_STATS_FETCH_PENDING: 'recovid/broker/STATS_FETCH_PENDING',
  BROKER_STATS_FETCH_FULFILLED: 'recovid/broker/STATS_FETCH_FULFILLED',
  BROKER_STATS_FETCH_REJECTED: 'recovid/broker/STATS_FETCH_REJECTED',
  BROKER_FREEZE: 'recovid/broker/FREEZE',
  BROKER_FREEZE_PENDING: 'recovid/broker/FREEZE_PENDING',
  BROKER_FREEZE_FULFILLED: 'recovid/broker/FREEZE_FULFILLED',
  BROKER_FREEZE_REJECTED: 'recovid/broker/FREEZE_REJECTED',
  BROKER_UNFREEZE: 'recovid/broker/UNFREEZE',
  BROKER_UNFREEZE_PENDING: 'recovid/broker/UNFREEZE_PENDING',
  BROKER_UNFREEZE_FULFILLED: 'recovid/broker/UNFREEZE_FULFILLED',
  BROKER_UNFREEZE_REJECTED: 'recovid/broker/UNFREEZE_REJECTED',
};

/**
 * Actions
 */

export const fetchBrokerStats = () =>
  createApiAction({
    type: actionTypes.BROKER_STATS_FETCH,
    method: 'GET',
    endpoint: '/broker/stats',
  });

export const freezeBroker = () =>
  createApiAction({
    type: actionTypes.BROKER_FREEZE,
    method: 'POST',
    endpoint: '/broker/freeze',
  });

export const unfreezeBroker = () =>
  createApiAction({
    type: actionTypes.BROKER_UNFREEZE,
    method: 'POST',
    endpoint: '/broker/unfreeze',
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign(
    {},
    {
      [actionTypes.BROKER_STATS_FETCH_PENDING]: state => state.set('stats', createRecord()),

      [actionTypes.BROKER_STATS_FETCH_FULFILLED]: (state, { payload }) =>
        state.set('stats', createRecord({ state: resourceStatus.FULFILLED, data: payload })),

      [actionTypes.BROKER_STATS_FETCH_REJECTED]: state =>
        state.set('stats', createRecord({ state: resourceStatus.FAILED })),

      [actionTypes.BROKER_FREEZE_PENDING]: state => state.set('freezeActionStatus', resourceStatus.PENDING),

      [actionTypes.BROKER_FREEZE_FULFILLED]: state => state.set('freezeActionStatus', resourceStatus.FULFILLED),

      [actionTypes.BROKER_FREEZE_REJECTED]: state => state.set('freezeActionStatus', resourceStatus.FAILED),

      [actionTypes.BROKER_UNFREEZE_PENDING]: state => state.set('unfreezeActionStatus', resourceStatus.PENDING),

      [actionTypes.BROKER_UNFREEZE_FULFILLED]: state => state.set('unfreezeActionStatus', resourceStatus.FULFILLED),

      [actionTypes.BROKER_UNFREEZE_REJECTED]: state => state.set('unfreezeActionStatus', resourceStatus.FAILED),
    }
  ),
  fromJS({
    stats: null,
    freezeActionStatus: null,
    unfreezeActionStatus: null,
  })
);

export default reducer;
