import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'sisStatus';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: () => '/extensions/sis/status',
});

export const fetchSisStatusIfNeeded = () => actions.fetchOneIfNeeded('status');

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
