import { createSelector } from 'reselect';

export const getSolutions = state => state.solutions.get('resources');
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
