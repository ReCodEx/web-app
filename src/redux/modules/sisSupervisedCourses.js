import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { fromJS } from 'immutable';
import { actionTypes } from './sisSupervisedCoursesTypes.js';
import { actionTypes as groupsActionTypes } from './groups.js';
/**
 * Create actions & reducer
 */

const resourceName = 'sisSupervisedCourses';
const { reduceActions } = factory({
  resourceName,
});

export const fetchSisSupervisedCourses = (userId, year, term) =>
  createApiAction({
    type: actionTypes.FETCH,
    method: 'GET',
    endpoint: `/extensions/sis/users/${userId}/supervised-courses/${year}/${term}`,
    meta: { userId, year, term },
  });

export const sisCreateGroup = (courseId, data, userId, year, term) =>
  createApiAction({
    type: actionTypes.CREATE,
    method: 'POST',
    endpoint: `/extensions/sis/remote-courses/${courseId}/create`,
    meta: { userId, courseId, year, term },
    body: { ...data },
  });

export const sisBindGroup = (courseId, data, userId, year, term) =>
  createApiAction({
    type: actionTypes.BIND,
    method: 'POST',
    endpoint: `/extensions/sis/remote-courses/${courseId}/bind`,
    meta: { courseId, userId, year, term },
    body: { ...data },
  });

export const sisUnbindGroup = (courseId, groupId, userId, year, term) =>
  createApiAction({
    type: actionTypes.UNBIND,
    method: 'DELETE',
    endpoint: `/extensions/sis/remote-courses/${courseId}/bindings/${groupId}`,
    meta: { courseId, groupId, userId, year, term },
  });

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.CREATE_FULFILLED]: (state, { meta: { userId, courseId, year, term }, payload: { id: groupId } }) =>
      state.updateIn(['resources', userId, `${year}-${term}`, 'data', courseId, 'groups'], groups =>
        groups.push(groupId)
      ),

    [actionTypes.BIND_FULFILLED]: (state, { meta: { courseId, userId, year, term }, payload: { id: groupId } }) =>
      state.updateIn(['resources', userId, `${year}-${term}`, 'data', courseId, 'groups'], groups =>
        groups.push(groupId)
      ),

    [actionTypes.UNBIND_FULFILLED]: (state, { meta: { courseId, groupId, userId } }) =>
      state.updateIn(['resources', userId], terms =>
        terms.map(term => term.updateIn(['data', courseId, 'groups'], groups => groups.filter(g => g !== groupId)))
      ),

    [actionTypes.FETCH_PENDING]: (state, { meta: { userId, year, term } }) =>
      state.setIn(['resources', userId, `${year}-${term}`], createRecord()),

    [actionTypes.FETCH_REJECTED]: (state, { meta: { userId, year, term } }) =>
      state.setIn(['resources', userId, `${year}-${term}`], createRecord({ state: resourceStatus.FAILED })),

    [actionTypes.FETCH_FULFILLED]: (state, { payload: { courses }, meta: { userId, year, term } }) =>
      state.setIn(
        ['resources', userId, `${year}-${term}`],
        createRecord({
          state: resourceStatus.FULFILLED,
          data: fromJS(
            courses.reduce((map, p) => {
              map[p.course.code] = p;
              return map;
            }, {})
          ),
        })
      ),

    [groupsActionTypes.REMOVE_FULFILLED]: (state, { meta: { id: groupId } }) =>
      state.update('resources', users =>
        users.map(userTerms =>
          userTerms.map(term =>
            term.update(
              'data',
              courses =>
                courses && courses.map(course => course.update('groups', groups => groups.filter(g => g !== groupId)))
            )
          )
        )
      ),
  }),
  initialState
);

export default reducer;
