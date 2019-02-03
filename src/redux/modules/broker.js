import { handleActions } from 'redux-actions';
import { createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { fromJS } from 'immutable';

export const actionTypes = {
  BROKER_STATS_FETCH: 'recodex/broker/STATS_FETCH',
  BROKER_STATS_FETCH_PENDING: 'recodex/broker/STATS_FETCH_PENDING',
  BROKER_STATS_FETCH_FULFILLED: 'recodex/broker/STATS_FETCH_FULFILLED',
  BROKER_STATS_FETCH_REJECTED: 'recodex/broker/STATS_FETCH_REJECTED',
  BROKER_FREEZE: 'recodex/broker/FREEZE',
  BROKER_UNFREEZE: 'recodex/broker/UNFREEZE'
};

/**
 * Actions
 */

export const fetchBrokerStats = () =>
  createApiAction({
    type: actionTypes.BROKER_STATS_FETCH,
    method: 'GET',
    endpoint: '/broker/stats'
  });

export const freezeBroker = () =>
  createApiAction({
    type: actionTypes.BROKER_FREEZE,
    method: 'POST',
    endpoint: '/broker/freeze'
  });

export const unfreezeBroker = () =>
  createApiAction({
    type: actionTypes.BROKER_UNFREEZE,
    method: 'POST',
    endpoint: '/broker/unfreeze'
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign(
    {},
    {
      [actionTypes.BROKER_STATS_FETCH_PENDING]: state =>
        state.setIn(['resources', 'stats'], createRecord()),

      [actionTypes.BROKER_STATS_FETCH_FULFILLED]: (state, { payload }) =>
        state.setIn(
          ['resources', 'stats'],
          createRecord({ state: resourceStatus.FULFILLED, data: payload })
        ),

      [actionTypes.BROKER_STATS_FETCH_REJECTED]: state =>
        state.setIn(
          ['resources', 'stats'],
          createRecord({ state: resourceStatus.FAILED })
        )
    }
  ),
  fromJS({}) // initial state is empty, because this is special resource
);

export default reducer;
