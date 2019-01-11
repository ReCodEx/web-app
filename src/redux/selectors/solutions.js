import { createSelector } from 'reselect';
import {
  fetchManyAssignmentSolutionsEndpoint,
  fetchManyUserSolutionsEndpoint
} from '../modules/solutions';

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

export const fetchManyAssignmentSolutionsStatus = assignmentId =>
  createSelector(getSolutionsRaw, state =>
    state.getIn([
      'fetchManyStatus',
      fetchManyAssignmentSolutionsEndpoint(assignmentId)
    ])
  );

export const fetchManyUserSolutionsStatus = (userId, assignmentId) =>
  createSelector(getSolutionsRaw, state =>
    state.getIn([
      'fetchManyStatus',
      fetchManyUserSolutionsEndpoint(userId, assignmentId)
    ])
  );
