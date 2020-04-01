// action types declaration was moved outside the auth module to break cyclic import dependencies
export const actionTypes = {
  FETCH: 'recovid/sisSupervisedCourses/FETCH',
  FETCH_PENDING: 'recovid/sisSupervisedCourses/FETCH_PENDING',
  FETCH_REJECTED: 'recovid/sisSupervisedCourses/FETCH_REJECTED',
  FETCH_FULFILLED: 'recovid/sisSupervisedCourses/FETCH_FULFILLED',
  CREATE: 'recovid/sisSupervisedCourses/CREATE',
  CREATE_FULFILLED: 'recovid/sisSupervisedCourses/CREATE_FULFILLED',
  BIND: 'recovid/sisSupervisedCourses/BIND',
  BIND_FULFILLED: 'recovid/sisSupervisedCourses/BIND_FULFILLED',
  UNBIND: 'recovid/sisSupervisedCourses/UNBIND',
  UNBIND_FULFILLED: 'recovid/sisSupervisedCourses/UNBIND_FULFILLED',
};
