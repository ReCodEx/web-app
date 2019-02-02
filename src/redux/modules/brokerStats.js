import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'brokerStats';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const fetchBrokerStats = () =>
  actions.fetchMany({
    endpoint: '/broker/stats'
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
