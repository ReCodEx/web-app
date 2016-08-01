import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import factory, { createRecord, initialState } from '../helpers/resourceManager';

const resourceName = 'evaluations';
const {
  actions,
  reduceActions
} = factory(
  resourceName,
  state => state.evaluations,
  id => `/submissions/${id}/evaluation`
);

/**
 * Actions
 */

export const loadEvaluationData = actions.pushResource;
export const fetchEvaluation = actions.fetchResource;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;
