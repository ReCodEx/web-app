import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/submissionEvaluations';
import { getSolutions } from './solutions';

const getParam = (state, id) => id;

const getSubmissionEvaluations = state => state.submissionEvaluations;
const getResources = submissionEvaluations => submissionEvaluations.get('resources');

export const submissionEvaluationsSelector = createSelector(getSubmissionEvaluations, getResources);

export const submissionEvaluationSelector = evaluationId =>
  createSelector(submissionEvaluationsSelector, submissionEvaluations => submissionEvaluations.get(evaluationId));

export const evaluationsForSubmissionSelector = createSelector(
  [getSolutions, submissionEvaluationsSelector, getParam],
  (submissions, evaluations, id) =>
    evaluations
      .filter(isReady)
      .filter(
        evaluation =>
          submissions &&
          submissions.getIn([id, 'data', 'submissions']) &&
          submissions.getIn([id, 'data', 'submissions']).indexOf(evaluation.getIn(['data', 'id'])) >= 0
      )
);

export const fetchManyStatus = id =>
  createSelector(getSubmissionEvaluations, state => state.getIn(['fetchManyStatus', fetchManyEndpoint(id)]));
