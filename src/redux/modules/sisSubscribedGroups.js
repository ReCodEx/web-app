import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { fromJS } from 'immutable';

/**
 * Create actions & reducer
 */

const resourceName = 'sisSubscribedGroups';
const { reduceActions } = factory({
  resourceName,
});

export const actionTypes = {
  FETCH: 'recodex/sisSubscribedGroups/FETCH',
  FETCH_PENDING: 'recodex/sisSubscribedGroups/FETCH_PENDING',
  FETCH_REJECTED: 'recodex/sisSubscribedGroups/FETCH_REJECTED',
  FETCH_FULFILLED: 'recodex/sisSubscribedGroups/FETCH_FULFILLED',
};

export const fetchSisSubscribedGroups = (userId, year, term) =>
  createApiAction({
    type: actionTypes.FETCH,
    method: 'GET',
    endpoint: `/extensions/sis/users/${userId}/subscribed-groups/${year}/${term}/as-student`,
    meta: { userId, year, term },
  });

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_PENDING]: (state, { meta: { userId, year, term } }) =>
      state.setIn(['resources', userId, `${year}-${term}`], createRecord()),

    [actionTypes.FETCH_REJECTED]: (state, { meta: { userId, year, term } }) =>
      state.setIn(['resources', userId, `${year}-${term}`], createRecord({ state: resourceStatus.FAILED })),

    [actionTypes.FETCH_FULFILLED]: (state, { payload: { courses }, meta: { userId, year, term } }) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({ state: resourceStatus.FULFILLED, data: fromJS(courses) })
      ),
  }),
  initialState
);

export default reducer;
