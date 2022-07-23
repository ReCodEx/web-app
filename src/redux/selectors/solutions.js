import { createSelector } from 'reselect';
import {
  fetchManyAssignmentSolutionsEndpoint,
  fetchManyUserSolutionsEndpoint,
  fetchManyGroupStudentsSolutionsEndpoint,
} from '../modules/solutions';

const getSolutionsRaw = state => state.solutions;
export const getSolutions = state => getSolutionsRaw(state).get('resources');
export const getSolution = id => createSelector(getSolutions, solutions => solutions.get(id));

export const isAccepted = id =>
  createSelector(getSolution(id), solution => solution.getIn(['data', 'accepted'], false));

export const isReviewed = id =>
  createSelector(getSolution(id), solution => solution.getIn(['data', 'reviewed'], false));

export const isSetFlagPending = (id, flag) =>
  createSelector(getSolution(id), solution => solution.get(`pending-set-flag-${flag}`, false));

export const fetchManyAssignmentSolutionsStatus = assignmentId =>
  createSelector(getSolutionsRaw, state =>
    state.getIn(['fetchManyStatus', fetchManyAssignmentSolutionsEndpoint(assignmentId)])
  );

export const fetchManyUserSolutionsStatus = createSelector(
  getSolutionsRaw,
  solutions => (userId, assignmentId) =>
    solutions.getIn(['fetchManyStatus', fetchManyUserSolutionsEndpoint(userId, assignmentId)])
);

export const fetchManyGroupStudentsSolutionsStatus = createSelector(
  getSolutionsRaw,
  solutions => (groupId, userId) =>
    solutions.getIn(['fetchManyStatus', fetchManyGroupStudentsSolutionsEndpoint(groupId, userId)])
);

// solvers

export const getAssignmentSolversLastUpdate = (state, assignmentId, groupId, userId) =>
  getSolutionsRaw(state).getIn(['assignment-solvers-fetches', `${assignmentId}|${groupId}|${userId}`]);

export const isAssignmentSolversLoading = state => getSolutionsRaw(state).get('assignment-solvers-loading', false);

export const getAssignmentSolver = (state, assignmentId, userId) =>
  getSolutionsRaw(state).getIn(['assignment-solvers', assignmentId, userId]);

const getAssignmentSolvers = state => getSolutionsRaw(state).get('assignment-solvers');

export const getAssignmentSolverSelector = createSelector(
  getAssignmentSolvers,
  assignmentSolvers => (assignmentId, userId) => assignmentSolvers && assignmentSolvers.getIn([assignmentId, userId])
);
