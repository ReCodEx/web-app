import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/submissionEvaluations';
import { getSubmission } from './submissions';

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

export const evaluationsForSubmissionSelector = submissionId =>
  createSelector(
    [getSubmission(submissionId), submissionEvaluationsSelector],
    (submission, evaluations) =>
      evaluations
        .filter(isReady)
        .filter(
          evaluation =>
            submission &&
            submission.getIn(['data', 'submissions']) &&
            submission
              .get('data')
              .get('submissions')
              .indexOf(evaluation.getIn(['data', 'id'])) >= 0
        )
  );

export const fetchManyStatus = id =>
  createSelector(getSubmissionEvaluations, state =>
    state.getIn(['fetchManyStatus', fetchManyEndpoint(id)])
  );
