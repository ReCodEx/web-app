import { createSelector } from 'reselect';
import { fetchManyAssignmentSolutionsEndpoint } from '../modules/solutions';

const getSolutionsRaw = state => state.solutions;
export const getSolutions = state => getSolutionsRaw(state).get('resources');
export const getSolution = id =>
  createSelector(getSolutions, solutions => solutions.get(id));

export const isAccepted = id =>
  createSelector(getSolution(id), solution =>
    solution.getIn(['data', 'accepted'], false)
  );

export const isAcceptPending = id =>
  createSelector(getSolution(id), solution =>
    solution.getIn(['data', 'accepted-pending'], false)
  );

export const fetchManyStatus = assignmentId =>
  createSelector(getSolutionsRaw, state =>
    state.getIn([
      'fetchManyStatus',
      fetchManyAssignmentSolutionsEndpoint(assignmentId)
    ])
  );
