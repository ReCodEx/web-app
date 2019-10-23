// action types declaration was moved outside the auth module to break cyclic import dependencies
export const actionTypes = {
  FETCH: 'recodex/sisSupervisedCourses/FETCH',
  FETCH_PENDING: 'recodex/sisSupervisedCourses/FETCH_PENDING',
  FETCH_REJECTED: 'recodex/sisSupervisedCourses/FETCH_REJECTED',
  FETCH_FULFILLED: 'recodex/sisSupervisedCourses/FETCH_FULFILLED',
  CREATE: 'recodex/sisSupervisedCourses/CREATE',
  CREATE_FULFILLED: 'recodex/sisSupervisedCourses/CREATE_FULFILLED',
  BIND: 'recodex/sisSupervisedCourses/BIND',
  BIND_FULFILLED: 'recodex/sisSupervisedCourses/BIND_FULFILLED',
  UNBIND: 'recodex/sisSupervisedCourses/UNBIND',
  UNBIND_FULFILLED: 'recodex/sisSupervisedCourses/UNBIND_FULFILLED',
};
