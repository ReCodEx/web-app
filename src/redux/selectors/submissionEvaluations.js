import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/submissionEvaluations';

const getSubmissionEvaluations = state => state.submissionEvaluations;
const getResources = submissionEvaluations =>
  submissionEvaluations.get('resources');

export const submissionEvaluationsSelector = createSelector(
  getSubmissionEvaluations,
  getResources
);

export const submissionEvaluationSelector = evaluationId =>
  createSelector(submissionEvaluationsSelector, submissionEvaluations =>
    submissionEvaluations.get(evaluationId)
  );

export const getSubmissionEvaluationsByIdsSelector = ids =>
  createSelector(submissionEvaluationsSelector, evaluations =>
    evaluations
      .filter(isReady)
      .filter(evaluation => ids.indexOf(evaluation.getIn(['data', 'id'])) >= 0)
  );

export const fetchManyStatus = id =>
  createSelector(getSubmissionEvaluations, state =>
    state.getIn(['fetchManyStatus', fetchManyEndpoint(id)])
  );
