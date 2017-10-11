import { createSelector } from 'reselect';

const getReferenceSolutionEvaluations = state =>
  state.referenceSolutionEvaluations;
const getResources = referenceSolutionEvaluations =>
  referenceSolutionEvaluations.get('resources');

export const referenceSolutionEvaluationsSelector = createSelector(
  getReferenceSolutionEvaluations,
  getResources
);

export const referenceSolutionEvaluationSelector = evaluationId =>
  createSelector(
    referenceSolutionEvaluationsSelector,
    referenceSolutionEvaluations =>
      referenceSolutionEvaluations.get(evaluationId)
  );
