import { createApiAction } from '../middleware/apiMiddleware';
import { handleActions } from 'redux-actions';
import { Map, List, fromJS } from 'immutable';

export const actionTypes = {
  SEARCH: 'recodex/search/SEARCH',
  SEARCH_PENDING: 'recodex/search/SEARCH_PENDING',
  SEARCH_REJECTED: 'recodex/search/SEARCH_REJECTED',
  SEARCH_FULFILLED: 'recodex/search/SEARCH_FULFILLED'
};

export const searchStatus = {
  READY: 'READY',
  PENDING: 'PENDING',
  FAILED: 'FAILED'
};

export const initialState = Map();
const initialSearchState = (id, query) => Map({ id, query, results: List(), status: searchStatus.PENDING });

export default handleActions({

  [actionTypes.SEARCH_PENDING]: (state, { meta: { id, query } }) => {
    if (!state.has(id)) {
      return state.set(id, initialSearchState(id, query));
    } else {
      return state.update(id, search => search.set('query', query).set('status', searchStatus.PENDING));
    }
  },

  [actionTypes.SEARCH_REJECTED]: (state, { meta: { id } }) =>
    state.update(id, search => search.set('status', searchStatus.FAILED)),

  [actionTypes.SEARCH_FULFILLED]: (state, { payload: results, meta: { id } }) => {
    return state.update(id, search => search.set('status', searchStatus.READY).set('results', fromJS(results)));
  }

}, initialState);

export const search = endpoint => (id, query) =>
  createApiAction({
    type: actionTypes.SEARCH,
    endpoint,
    meta: { id, query },
    query: { search: query }
  });

export const searchPeople = instanceId =>
  search(`/instances/${instanceId}/users`);

export const searchExercises = () =>
  search('/exercises');
