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
  BROKER_FREEZE_PENDING: 'recodex/broker/FREEZE_PENDING',
  BROKER_FREEZE_FULFILLED: 'recodex/broker/FREEZE_FULFILLED',
  BROKER_FREEZE_REJECTED: 'recodex/broker/FREEZE_REJECTED',
  BROKER_UNFREEZE: 'recodex/broker/UNFREEZE',
  BROKER_UNFREEZE_PENDING: 'recodex/broker/UNFREEZE_PENDING',
  BROKER_UNFREEZE_FULFILLED: 'recodex/broker/UNFREEZE_FULFILLED',
  BROKER_UNFREEZE_REJECTED: 'recodex/broker/UNFREEZE_REJECTED'
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
        ),

      [actionTypes.BROKER_FREEZE_PENDING]: state =>
        state.setIn(['resources', 'freeze'], createRecord()),
      [actionTypes.BROKER_FREEZE_FULFILLED]: state =>
        state.setIn(
          ['resources', 'freeze'],
          createRecord({ state: resourceStatus.FULFILLED })
        ),
      [actionTypes.BROKER_FREEZE_REJECTED]: state =>
        state.setIn(
          ['resources', 'freeze'],
          createRecord({ state: resourceStatus.FAILED })
        ),

      [actionTypes.BROKER_UNFREEZE_PENDING]: state =>
        state.setIn(['resources', 'unfreeze'], createRecord()),
      [actionTypes.BROKER_UNFREEZE_FULFILLED]: state =>
        state.setIn(
          ['resources', 'unfreeze'],
          createRecord({ state: resourceStatus.FULFILLED })
        ),
      [actionTypes.BROKER_UNFREEZE_REJECTED]: state =>
        state.setIn(
          ['resources', 'unfreeze'],
          createRecord({ state: resourceStatus.FAILED })
        )
    }
  ),
  fromJS({}) // initial state is empty, because this is special resource
);

export default reducer;
