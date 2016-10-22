/**
 * Action creators for the resource manager.
 * @module actionCreatorsFactory
 */

import { resourceStatus, isLoading, hasFailed, didInvalidate } from './status';


const actionCreatorsFactory = ({
  actionTypes,
  selector,
  apiEndpointFactory,
  needsRefetching,
  createAction,
  createApiAction
}) => {
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
      Promise.all(
        ids.map(id =>
          needsRefetching(getItem(id, getState))
            ? dispatch(fetchResource(id))
            : Promise.resolve()
        )
      );

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
    resource => ({ id: resource.get('id') })
  );

  const addResource = (data, tmpId = Math.random().toString()) => createApiAction({
    type: actionTypes.ADD,
    method: 'POST',
    endpoint: apiEndpointFactory(),
    body: data,
    meta: { tmpId }
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

export default actionCreatorsFactory;
