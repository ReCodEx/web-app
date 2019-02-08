import { createSelector } from 'reselect';
import { fetchManyEndpoint } from '../modules/submissionFailures';
import { isReady, getJsData } from '../helpers/resourceManager';

const getSubmissionFailures = state => state.submissionFailures;
const getResources = failures => failures.get('resources');

export const submissionFailuresSelector = createSelector(
  getSubmissionFailures,
  getResources
);

export const fetchManyStatus = createSelector(
  getSubmissionFailures,
  state => state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const getSubmissionFailure = failureId =>
  createSelector(
    submissionFailuresSelector,
    failures => failures.get(failureId)
  );

export const readySubmissionFailuresSelector = createSelector(
  submissionFailuresSelector,
  failures =>
    failures
      .toList()
      .filter(isReady)
      .map(getJsData)
      .sort((a, b) => b.createdAt - a.createdAt)
      .toArray()
);
