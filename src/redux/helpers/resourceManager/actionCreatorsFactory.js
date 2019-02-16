/**
 * Action creators for the resource manager.
 * @module actionCreatorsFactory
 */

import { isLoading } from './status';
import { getJsData } from './recordFactory';

const actionCreatorsFactory = ({
  actionTypes,
  selector,
  apiEndpointFactory,
  needsRefetching,
  createAction,
  createApiAction,
}) => {
  const archivedPromises = {};

  const getItem = (id, getState) => {
    const state = selector(getState());
    return !state ? null : state.getIn(['resources', id]);
  };

  const fetchMany = apiOptions =>
    createApiAction({
      type: actionTypes.FETCH_MANY,
      method: 'GET',
      endpoint: apiEndpointFactory(),
      ...apiOptions,
    });

  const fakeResult = item => ({
    value: getJsData(item),
  });

  const fetchIfNeeded = (...ids) => (dispatch, getState) => Promise.all(ids.map(id => dispatch(fetchOneIfNeeded(id))));

  const fetchOneIfNeeded = id => (dispatch, getState) => {
    if (needsRefetching(getItem(id, getState))) {
      archivedPromises[id] = dispatch(fetchResource(id));
    }

    const item = getItem(id, getState);
    return isLoading(item) ? archivedPromises[id] : Promise.resolve(fakeResult(item));
  };

  const fetchResource = id =>
    createApiAction({
      type: actionTypes.FETCH,
      method: 'GET',
      endpoint: apiEndpointFactory(id),
      meta: { id },
    });

  const pushResource = createAction(
    actionTypes.FETCH_FULFILLED,
    resource => resource,
    resource => ({ id: resource.get('id') })
  );

  const addResource = (body, tmpId = Math.random().toString(), endpoint = apiEndpointFactory('')) =>
    createApiAction({
      type: actionTypes.ADD,
      method: 'POST',
      endpoint,
      body,
      meta: { tmpId, body },
    });

  const updateResource = (id, body, endpoint = apiEndpointFactory(id)) =>
    createApiAction({
      type: actionTypes.UPDATE,
      method: 'POST',
      endpoint,
      body,
      meta: { id, body },
    });

  const removeResource = (id, endpoint = apiEndpointFactory(id)) =>
    createApiAction({
      type: actionTypes.REMOVE,
      method: 'DELETE',
      endpoint,
      meta: { id },
    });

  const invalidate = createAction(actionTypes.INVALIDATE);

  return {
    fetchMany,
    fetchIfNeeded,
    fetchOneIfNeeded,
    fetchResource,
    addResource,
    removeResource,
    updateResource,
    invalidate,
    pushResource,
  };
};

export default actionCreatorsFactory;
