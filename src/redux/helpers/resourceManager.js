import { fromJS } from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypesFactory = (resourceName) => {
  const twoPhaseActions = [ 'ADD', 'UPDATE', 'REMOVE', 'FETCH', 'FETCH_MANY' ];
  const onePhaseActions = [ 'INVALIDATE' ];

  return Object.assign(
    {},
    twoPhaseActions.reduce(
      (acc, action) => Object.assign({}, acc, {
        [action]: `recodex/resource/${resourceName}/${action}`,
        [`${action}_PENDING`]: `recodex/resource/${resourceName}/${action}_PENDING`,
        [`${action}_FULFILLED`]: `recodex/resource/${resourceName}/${action}_FULFILLED`,
        [`${action}_FAILED`]: `recodex/resource/${resourceName}/${action}_FAILED`
      }),
      {}
    ),
    onePhaseActions.reduce(
      (acc, action) => Object.assign({}, acc, {
        [action]: `recodex/resource/${resourceName}/${action}`
      }),
      {}
    )
  );
};

const resourceStatus = {
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  FULFILLED: 'FULFILLED'
};

export const isLoading = (item) =>
    !item || item.get('state') === resourceStatus.PENDING;

export const hasFailed = (item) =>
    !!item && item.get('state') === resourceStatus.FAILED;

export const isReady = (item) =>
    !!item && item.get('state') === resourceStatus.FULFILLED && !!item.get('data');

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

  const addResource = data => createApiAction({
    type: actionTypes.ADD,
    method: 'POST',
    endpoint: apiEndpointFactory(),
    meta: { tmpId: Math.random().toString() }
  });

  const updateResource = (id, data) => createApiAction({
    type: actionTypes.UPDATE,
    method: 'PUT',
    endpoint: apiEndpointFactory(),
    meta: { tmpId: Math.random().toString() }
  });

  const removeResource = id => createApiAction({
    type: actionTypes.REMOVE,
    method: 'DELETE',
    endpoint: apiEndpointFactory(id),
    meta: { id }
  });

  const invalidate = createAction(actionTypes.INVALIDATE);

  return {
    fetchMany,
    fetchIfNeeded,
    fetchOneIfNeeded,
    fetchResource,
    addResource,
    removeResource,
    invalidate,
    pushResource
  };
};

export const initialState = fromJS({ resources: {}, fetchManyStatus: {} });

export const createRecord = ({
  data = null,
  state = resourceStatus.PENDING,
  didInvalidate = false
} = {}) => fromJS({
  state,
  data,
  didInvalidate: false,
  lastUpdate: Date.now()
});

export const reducerFactory = (resourceName, getId = defaultGetId) => {
  const actionTypes = actionTypesFactory(resourceName);
  return {
    [actionTypes.FETCH_PENDING]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord()),

    [actionTypes.FETCH_FAILED]: (state, { meta }) =>
      state.setIn([ 'resources', meta.id ], createRecord({ state: resourceStatus.FAILED })),

    [actionTypes.FETCH_FULFILLED]: (state, { meta, payload: data }) =>
      state.setIn([ 'resources', meta.id ], createRecord({ state: resourceStatus.FULFILLED, data })),

    [actionTypes.FETCH_MANY_PENDING]: (state, { meta: {endpoint} }) =>
      state.setIn([ 'fetchManyStatus', endpoint ], resourceStatus.PENDING),

    [actionTypes.FETCH_MANY_FAILED]: (state, { meta: {endpoint} }) =>
      state.setIn([ 'fetchManyStatus', endpoint ], resourceStatus.FAILED),

    [actionTypes.FETCH_MANY_FULFILLED]: (state, { meta: {endpoint}, payload }) =>
      payload.reduce(
        (state, data) =>
          state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),
        state
      ).setIn([ 'fetchManyStatus', endpoint ], resourceStatus.LOADED),

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
