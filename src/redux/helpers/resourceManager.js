import { Map } from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypesFactory = (resourceName) => ({
  FETCH: `recodex/resource/${resourceName}/FETCH`,
  FETCH_PENDING: `recodex/resource/${resourceName}/FETCH_PENDING`,
  FETCH_FULFILLED: `recodex/resource/${resourceName}/FETCH_FULFILLED`,
  FETCH_FAILED: `recodex/resource/${resourceName}/FETCH_REJECTED`,
  INVALIDATE: `recodex/resource/${resourceName}/INVALIDATE`
});

export const isLoading = (item) =>
    !item || item.isFetching === true;

export const hasFailed = (item) =>
    !!item && item.error === true;

export const isReady = (item) =>
    !!item && !!item.data;

export const isTooOld = (item) =>
  Date.now() - item.lastUpdate > 10 * 60 * 1000; // 10 minutes - @todo: Make configurable

/** Does the given item need refetching or is it already cached? */
export const defaultNeedsRefetching = (item) =>
  !item || (
    item.isFetching === false && (
      item.error === true || item.didInvalidate === true
    )
  ) ||
  isTooOld(item);

export const actionsFactory = ({
  resourceName,
  selector,
  apiEndpointFactory,
  needsRefetching = defaultNeedsRefetching
}) => {
  const actionTypes = actionTypesFactory(resourceName);
  const getItem = (id, getState) => {
    const state = selector(getState());
    return !state ? null : state.getIn(['resources', id]);
  };

  const fetchIfNeeded = (...ids) =>
    (dispatch, getState) =>
      ids.map(id => needsRefetching(getItem(id, getState)) && dispatch(fetchResource(id)));

  const fetchOneIfNeeded = (id) =>
    (dispatch, getState) =>
      needsRefetching(getItem(id, getState))
        ? dispatch(fetchResource(id))
        : Promise.resolve();

  const fetchResource = (id) =>
    createApiAction({
      type: actionTypes.FETCH,
      method: 'GET',
      endpoint: apiEndpointFactory(id),
      meta: { id }
    });

  const pushResource = createAction(
    actionTypes.FETCH_FULFILLED,
    user => user,
    user => ({ id: user.id })
  );
  const invalidate = createAction(actionTypes.INVALIDATE);

  return {
    fetchIfNeeded,
    fetchOneIfNeeded,
    fetchResource,
    invalidate,
    pushResource
  };
};

export const initialState = Map({
  resources: Map()
});

export const createRecord = (isFetching, error, didInvalidate, data) =>
   ({ isFetching, error, didInvalidate, data, lastUpdate: Date.now() });

export const reducerFactory = (resourceName) => {
  const actionTypes = actionTypesFactory(resourceName);
  return {
    [actionTypes.FETCH_PENDING]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord(true, false, false, null)),

    [actionTypes.FETCH_FAILED]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord(false, true, false, null)),

    [actionTypes.FETCH_FULFILLED]: (state, { meta, payload }) =>
      state.setIn([ 'resources', meta.id ], createRecord(false, false, false, payload)),

    [actionTypes.INVALIDATE]: (state, { payload }) =>
      state.updateIn([ 'resources', payload ], item => Object.assign({}, item, { didInvalidate: true }))

  };
};

export default ({
  resourceName,
  selector = (state) => state[resourceName],
  apiEndpointFactory = (id) => `/${resourceName}/${id}`,
  needsRefetching
}) => ({
  actionTypes: actionTypesFactory(resourceName),
  actions: actionsFactory({ resourceName, selector, apiEndpointFactory, needsRefetching }),
  reduceActions: reducerFactory(resourceName)
});
