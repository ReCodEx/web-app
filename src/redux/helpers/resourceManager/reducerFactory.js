import { fromJS } from 'immutable';
import createRecord from './recordFactory';
import { resourceStatus } from './status';

export const initialState = fromJS({ resources: {}, fetchManyStatus: {} });

const reducerFactory = (actionTypes) => ({
  [actionTypes.FETCH_PENDING]: (state, { meta }) =>
    state.setIn([ 'resources', meta.id ], createRecord()),

  [actionTypes.FETCH_REJECTED]: (state, { meta }) =>
    state.setIn([ 'resources', meta.id ], createRecord({ state: resourceStatus.FAILED })),

  [actionTypes.FETCH_FULFILLED]: (state, { meta, payload: data }) =>
    state.setIn([ 'resources', meta.id ], createRecord({ state: resourceStatus.FULFILLED, data })),

  [actionTypes.FETCH_MANY_PENDING]: (state, { meta: {endpoint} }) =>
    state.setIn([ 'fetchManyStatus', endpoint ], resourceStatus.PENDING),

  [actionTypes.FETCH_MANY_REJECTED]: (state, { meta: {endpoint} }) =>
    state.setIn([ 'fetchManyStatus', endpoint ], resourceStatus.FAILED),

  [actionTypes.FETCH_MANY_FULFILLED]: (state, { meta: {endpoint}, payload }) =>
    payload.reduce(
      (state, data) =>
        state.setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),
      state
    ).setIn([ 'fetchManyStatus', endpoint ], resourceStatus.LOADED),

  [actionTypes.INVALIDATE]: (state, { payload }) =>
    state.updateIn([ 'resources', payload ], data => createRecord({ data, didInvalidate: true }))
});

export default reducerFactory;
