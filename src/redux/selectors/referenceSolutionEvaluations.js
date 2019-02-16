import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/referenceSolutionEvaluations';
import { getReferenceSolution } from './referenceSolutions';

const getReferenceSolutionEvaluations = state => state.referenceSolutionEvaluations;
const getResources = referenceSolutionEvaluations => referenceSolutionEvaluations.get('resources');

export const referenceSolutionEvaluationsSelector = createSelector(
  getReferenceSolutionEvaluations,
  getResources
);

export const referenceSolutionEvaluationSelector = evaluationId =>
  createSelector(
    referenceSolutionEvaluationsSelector,
    referenceSolutionEvaluations => referenceSolutionEvaluations.get(evaluationId)
  );

export const getReferenceSolutionEvaluationsByIdsSelector = ids =>
  createSelector(
    referenceSolutionEvaluationsSelector,
    evaluations => evaluations.filter(isReady).filter(evaluation => ids.indexOf(evaluation.getIn(['data', 'id'])) >= 0)
  );

export const evaluationsForReferenceSolutionSelector = solutionId =>
  createSelector(
    [getReferenceSolution(solutionId), referenceSolutionEvaluationsSelector],
    (solution, evaluations) =>
      evaluations.filter(isReady).filter(
        evaluation =>
          solution &&
          solution.getIn(['data', 'submissions']) &&
          solution
            .get('data')
            .get('submissions')
            .indexOf(evaluation.getIn(['data', 'id'])) >= 0
      )
  );

export const fetchManyStatus = id =>
  createSelector(
    getReferenceSolutionEvaluations,
    state => state.getIn(['fetchManyStatus', fetchManyEndpoint(id)])
  );
