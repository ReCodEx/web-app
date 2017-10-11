import { createSelector } from 'reselect';

export const getReferenceSolutionEvaluationsSection = state =>
  state.environmentReferenceSolutionEvaluations;
export const getEnvironmentReferenceEvaluations = id =>
  createSelector(getReferenceSolutionEvaluationsSection, solution =>
    solution.getIn(['resources', id])
  );
