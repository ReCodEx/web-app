import { handleActions } from 'redux-actions';
import {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypes = {
  BROKER_STATS_FETCH: 'recodex/brokerStats/FETCH',
  BROKER_STATS_FETCH_PENDING: 'recodex/brokerStats/FETCH_PENDING',
  BROKER_STATS_FETCH_FULFILLED: 'recodex/brokerStats/FETCH_FULFILLED',
  BROKER_STATS_FETCH_REJECTED: 'recodex/brokerStats/FETCH_REJECTED'
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

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign(
    {},
    {
      [actionTypes.BROKER_STATS_FETCH_PENDING]: state =>
        state.setIn(['resources'], createRecord()),

      [actionTypes.BROKER_STATS_FETCH_FULFILLED]: (state, { payload }) =>
        state.setIn(
          ['resources'],
          createRecord({ state: resourceStatus.FULFILLED, data: payload })
        ),

      [actionTypes.BROKER_STATS_FETCH_REJECTED]: state =>
        state.setIn(
          ['resources'],
          createRecord({ state: resourceStatus.FAILED })
        )
    }
  ),
  initialState
);

export default reducer;
