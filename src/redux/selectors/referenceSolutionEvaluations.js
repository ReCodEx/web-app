import { createSelector } from 'reselect';

export const getReferenceSolutionEvaluationsSection = state =>
  state.referenceSolutionEvaluations;
export const getReferenceEvaluations = id =>
  createSelector(getReferenceSolutionEvaluationsSection, solution =>
    solution.getIn(['resources', id])
  );
