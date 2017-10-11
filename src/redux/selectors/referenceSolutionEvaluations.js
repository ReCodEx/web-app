import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

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

export const getReferenceSolutionEvaluationsByIdsSelector = ids =>
  createSelector(referenceSolutionEvaluationsSelector, evaluations =>
    evaluations
      .filter(isReady)
      .filter(evaluation => ids.indexOf(evaluation.getIn(['data', 'id'])) >= 0)
  );
