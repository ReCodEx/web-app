import { fromJS } from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypesFactory = (resourceName) => ({
  FETCH: `recodex/resource/${resourceName}/FETCH`,
  FETCH_PENDING: `recodex/resource/${resourceName}/FETCH_PENDING`,
  FETCH_FULFILLED: `recodex/resource/${resourceName}/FETCH_FULFILLED`,
  FETCH_FAILED: `recodex/resource/${resourceName}/FETCH_REJECTED`,
  FETCH_MANY: `recodex/resource/${resourceName}/FETCH_MANY`,
  FETCH_MANY_PENDING: `recodex/resource/${resourceName}/FETCH_MANY_PENDING`,
  FETCH_MANY_FULFILLED: `recodex/resource/${resourceName}/FETCH_MANY_FULFILLED`,
  FETCH_MANY_FAILED: `recodex/resource/${resourceName}/FETCH_MANY_REJECTED`,
  INVALIDATE: `recodex/resource/${resourceName}/INVALIDATE`
});

export const status = {
  LOADING: 'LOADING',
  FAILED: 'FAILED',
  LOADED: 'LOADED'
};

export const isLoading = (item) =>
    !item || item.get('isFetching') === true;

export const hasFailed = (item) =>
    !!item && item.get('error') === true;

export const isReady = (item) =>
    !!item && !!item.get('data');

export const isTooOld = (item) =>
  Date.now() - item.get('lastUpdate') > 10 * 60 * 1000; // 10 minutes - @todo: Make configurable

export const defaultGetId = (item) => item.get('id');

/** Does the given item need refetching or is it already cached? */
export const defaultNeedsRefetching = (item) =>
  !item || (
    item.get('isFetching') === false && (
      item.get('error') === true || item.get('didInvalidate') === true
    )
  ) ||
  isTooOld(item);

export const actionsFactory = ({
  resourceName,
  selector,
  apiEndpointFactory,
  needsRefetching = defaultNeedsRefetching,
  getId = defaultGetId
}) => {
  const actionTypes = actionTypesFactory(resourceName);
  const getItem = (id, getState) => {
    const state = selector(getState());
    return !state ? null : state.getIn(['resources', id]);
  };

  const fetchMany = apiOptions =>
    createApiAction({
      type: actionTypes.FETCH_MANY,
      method: 'GET',
      endpoint: apiEndpointFactory(),
      ...apiOptions
    });

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
    resource => resource,
    resource => ({ id: getId(resource) })
  );

  const invalidate = createAction(actionTypes.INVALIDATE);

  return {
    fetchMany,
    fetchIfNeeded,
    fetchOneIfNeeded,
    fetchResource,
    invalidate,
    pushResource
  };
};

export const initialState = fromJS({ resources: {}, fetchManyStatus: {} });

export const createRecord = (isFetching, error, didInvalidate, data) =>
   (fromJS({ isFetching, error, didInvalidate, data, lastUpdate: Date.now() }));

export const reducerFactory = (resourceName, getId = defaultGetId) => {
  const actionTypes = actionTypesFactory(resourceName);
  return {
    [actionTypes.FETCH_PENDING]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord(true, false, false, null)),

    [actionTypes.FETCH_FAILED]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord(false, true, false, null)),

    [actionTypes.FETCH_FULFILLED]: (state, { meta, payload }) =>
      state.setIn([ 'resources', meta.id ], createRecord(false, false, false, payload)),

    [actionTypes.FETCH_MANY_PENDING]: (state, { meta: { endpoint } }) =>
      state.setIn([ 'fetchManyStatus', endpoint ], status.LOADING),

    [actionTypes.FETCH_MANY_FAILED]: (state, { meta: { endpoint } }) =>
      state.setIn([ 'fetchManyStatus', endpoint ], status.FAILED),

    [actionTypes.FETCH_MANY_FULFILLED]: (state, { meta: { endpoint }, payload }) =>
      payload.reduce((state, res) => state.setIn(['resources', res.id], createRecord(false, false, false, res)), state)
        .setIn([ 'fetchManyStatus', endpoint ], status.LOADED),

    [actionTypes.INVALIDATE]: (state, { payload }) =>
      state.updateIn([ 'resources', payload ], item => Object.assign({}, item, { didInvalidate: true }))

  };
};

export default ({
  resourceName,
  selector = (state) => state[resourceName],
  apiEndpointFactory = (id) => `/${resourceName}/${id}`,
  needsRefetching,
  getId = defaultGetId
}) => ({
  actionTypes: actionTypesFactory(resourceName),
  actions: actionsFactory({ resourceName, selector, apiEndpointFactory, needsRefetching, getId }),
  reduceActions: reducerFactory(resourceName)
});
