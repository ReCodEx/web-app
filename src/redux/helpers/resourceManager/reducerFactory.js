import { fromJS } from 'immutable';
import createRecord from './recordFactory.js';
import { resourceStatus } from './status.js';

export const initialState = fromJS({ resources: {}, fetchManyStatus: {} });

const isAbortError = error => error?.name === 'AbortError';

const reducerFactory = (actionTypes, id = 'id') => ({
  [actionTypes.FETCH_PENDING]: (state, { meta }) =>
    meta.allowReload && state.getIn(['resources', meta[id], 'state']) === resourceStatus.FULFILLED
      ? state.setIn(['resources', meta[id], 'state'], resourceStatus.RELOADING)
      : state.setIn(['resources', meta[id]], createRecord()),

  [actionTypes.FETCH_REJECTED]: (state, { meta, payload: error }) =>
    state.setIn(
      ['resources', meta[id]],
      createRecord({ state: isAbortError(error) ? resourceStatus.ABORTED : resourceStatus.FAILED, error })
    ),

  [actionTypes.FETCH_FULFILLED]: (state, { meta, payload: data }) =>
    state.setIn(['resources', meta[id]], createRecord({ state: resourceStatus.FULFILLED, data })),

  [actionTypes.ADD_PENDING]: (state, { meta: { tmpId }, payload }) =>
    state.setIn(['resources', tmpId], createRecord({ state: resourceStatus.POSTING, payload })),

  [actionTypes.ADD_REJECTED]: (state, { meta: { tmpId } }) => state.removeIn(['resources', tmpId]),

  [actionTypes.ADD_FULFILLED]: (state, { meta: { tmpId }, payload: data }) =>
    state
      .removeIn(['resources', tmpId])
      .setIn(['resources', data[id]], createRecord({ state: resourceStatus.FULFILLED, data })),

  [actionTypes.FETCH_MANY_PENDING]: (state, { meta: { endpoint, allowReload = false } }) =>
    state.setIn(
      ['fetchManyStatus', endpoint],
      allowReload && state.getIn(['fetchManyStatus', endpoint]) === resourceStatus.FULFILLED
        ? resourceStatus.RELOADING
        : resourceStatus.PENDING
    ),

  [actionTypes.FETCH_MANY_REJECTED]: (state, { meta: { endpoint }, payload: error }) =>
    state.setIn(['fetchManyStatus', endpoint], isAbortError(error) ? resourceStatus.ABORTED : resourceStatus.FAILED),

  [actionTypes.FETCH_MANY_FULFILLED]: (state, { meta: { endpoint }, payload }) =>
    payload
      .reduce(
        (state, data) => state.setIn(['resources', data[id]], createRecord({ state: resourceStatus.FULFILLED, data })),
        state
      )
      .setIn(['fetchManyStatus', endpoint], resourceStatus.FULFILLED),

  [actionTypes.UPDATE_FULFILLED]: (state, { payload, meta: { id } }) =>
    state.setIn(['resources', id, 'data'], fromJS(payload)),

  [actionTypes.REMOVE_PENDING]: (state, { meta: { id } }) =>
    state.setIn(['resources', id, 'state'], resourceStatus.DELETING),

  [actionTypes.REMOVE_REJECTED]: (state, { meta: { id } }) =>
    state.setIn(['resources', id, 'state'], resourceStatus.FULFILLED), // back to normal

  [actionTypes.REMOVE_FULFILLED]: (state, { meta: { id } }) => state.removeIn(['resources', id]),

  [actionTypes.INVALIDATE]: (state, { payload }) =>
    state.updateIn(['resources', payload], data => createRecord({ data, didInvalidate: true })),
});

export default reducerFactory;
