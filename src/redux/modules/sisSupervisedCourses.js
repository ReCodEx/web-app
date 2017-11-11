import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { fromJS } from 'immutable';

/**
 * Create actions & reducer
 */

const resourceName = 'sisSupervisedCourses';
const { reduceActions } = factory({
  resourceName
});

export const actionTypes = {
  FETCH: 'recodex/sisSupervisedCourses/FETCH',
  FETCH_PENDING: 'recodex/sisSupervisedCourses/FETCH_PENDING',
  FETCH_REJECTED: 'recodex/sisSupervisedCourses/FETCH_REJECTED',
  FETCH_FULFILLED: 'recodex/sisSupervisedCourses/FETCH_FULFILLED',
  CREATE: 'recodex/sisSupervisedCourses/CREATE',
  CREATE_FULFILLED: 'recodex/sisSupervisedCourses/CREATE_FULFILLED',
  BIND: 'recodex/sisSupervisedCourses/BIND',
  BIND_FULFILLED: 'recodex/sisSupervisedCourses/BIND_FULFILLED'
};

export const fetchSisSupervisedCourses = (userId, year, term) =>
  createApiAction({
    type: actionTypes.FETCH,
    method: 'GET',
    endpoint: `/extensions/sis/users/${userId}/supervised-courses/${year}/${term}`,
    meta: { userId, year, term }
  });

export const sisCreateGroup = (courseId, data, userId, year, term) =>
  createApiAction({
    type: actionTypes.CREATE,
    method: 'POST',
    endpoint: `/extensions/sis/remote-courses/${courseId}/create`,
    meta: { userId, courseId, year, term },
    body: { ...data }
  });

export const sisBindGroup = (courseId, data, userId, year, term) =>
  createApiAction({
    type: actionTypes.BIND,
    method: 'POST',
    endpoint: `/extensions/sis/remote-courses/${courseId}/bind`,
    meta: { courseId, userId, year, term },
    body: { ...data }
  });

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.CREATE_FULFILLED]: (
      state,
      { meta: { userId, year, term }, payload }
    ) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({ state: resourceStatus.FULFILLED, data: fromJS(payload) })
      ),

    [actionTypes.BIND_FULFILLED]: (
      state,
      { meta: { userId, year, term }, payload }
    ) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({ state: resourceStatus.FULFILLED, data: fromJS(payload) })
      ),

    [actionTypes.FETCH_PENDING]: (state, { meta: { userId, year, term } }) =>
      state.setIn(['resources', userId, `${year}-${term}`], createRecord()),

    [actionTypes.FETCH_REJECTED]: (state, { meta: { userId, year, term } }) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({ state: resourceStatus.FAILED })
      ),

    [actionTypes.FETCH_FULFILLED]: (
      state,
      { payload, meta: { userId, year, term } }
    ) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({ state: resourceStatus.FULFILLED, data: fromJS(payload) })
      )
  }),
  initialState
);

export default reducer;
