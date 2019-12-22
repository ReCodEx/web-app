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

  const fetchOneIfNeeded = (id, meta = {}) => (dispatch, getState) => {
    if (needsRefetching(getItem(id, getState))) {
      archivedPromises[id] = dispatch(fetchResource(id, meta));
    }

    const item = getItem(id, getState);
    return isLoading(item) ? archivedPromises[id] : Promise.resolve(fakeResult(item));
  };

  const fetchResource = (id, meta = {}) =>
    createApiAction({
      type: actionTypes.FETCH,
      method: 'GET',
      endpoint: apiEndpointFactory(id),
      meta: { ...meta, id },
    });

  const pushResource = createAction(
    actionTypes.FETCH_FULFILLED,
    resource => resource,
    resource => ({ id: resource.get('id') })
  );

  const addResource = (body, tmpId = Math.random().toString(), endpoint = apiEndpointFactory(''), meta = {}) =>
    createApiAction({
      type: actionTypes.ADD,
      method: 'POST',
      endpoint,
      body,
      meta: { ...meta, tmpId, body },
    });

  const updateResource = (id, body, endpoint = apiEndpointFactory(id), meta = {}) =>
    createApiAction({
      type: actionTypes.UPDATE,
      method: 'POST',
      endpoint,
      body,
      meta: { ...meta, id, body },
    });

  const removeResource = (id, endpoint = apiEndpointFactory(id), meta = {}) =>
    createApiAction({
      type: actionTypes.REMOVE,
      method: 'DELETE',
      endpoint,
      meta: { ...meta, id },
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
