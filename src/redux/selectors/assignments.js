import { createSelector, lruMemoize } from 'reselect';
import { EMPTY_LIST, EMPTY_MAP } from '../../helpers/common.js';
import { getSolutions } from './solutions.js';
import { getAsyncJobSelector } from './asyncJobs.js';
import { runtimeEnvironmentSelector } from './runtimeEnvironments.js';
import { isReady, getJsData } from '../helpers/resourceManager';

export const getAssignments = state => state.assignments;

const getAssignmentResources = state => getAssignments(state).get('resources');
const getParam = (state, id) => id;

export const getAssignment = createSelector([getAssignmentResources, getParam], (assignments, id) =>
  assignments.get(id)
);
export const getAssignmentSelector = createSelector(getAssignmentResources, assignments => id => assignments.get(id));

export const getExerciseAssignments = createSelector([getAssignmentResources, getParam], (assignments, exerciseId) =>
  assignments.filter(assignment => isReady(assignment) && assignment.getIn(['data', 'exerciseId']) === exerciseId)
);

const _getAssignmentEnvironments = (assignmentSelector, envSelector, id) => {
  const assignment = assignmentSelector(id);
  const envIds = assignment && assignment.getIn(['data', 'runtimeEnvironmentIds']);
  const disabledEnvIds = assignment && assignment.getIn(['data', 'disabledRuntimeEnvironmentIds']);

  return envIds && disabledEnvIds && envSelector
    ? envIds
        .toArray()
        .filter(env => !disabledEnvIds.toArray().includes(env))
        .map(envSelector)
    : null;
};

export const getAssignmentEnvironments = createSelector(
  [getAssignmentSelector, runtimeEnvironmentSelector, getParam],
  _getAssignmentEnvironments
);

export const assignmentEnvironmentsSelector = createSelector(
  [getAssignmentSelector, runtimeEnvironmentSelector],
  (assignmentSelector, envSelector) => id => _getAssignmentEnvironments(assignmentSelector, envSelector, id)
);

export const getAssignmentSolutions = createSelector(
  [getSolutions, getAssignments, getParam],
  (solutions, assignments, assignmentId) =>
    assignments
      .getIn(['solutions', assignmentId], EMPTY_MAP)
      .toList()
      .flatten()
      .map(id => solutions.get(id))
      .filter(a => a)
);

export const getUserSolutions = createSelector([getSolutions, getAssignments], (solutions, assignments) =>
  lruMemoize((userId, assignmentId) =>
    assignments
      .getIn(['solutions', assignmentId, userId], EMPTY_LIST)
      .map(id => solutions.get(id))
      .filter(a => a)
  )
);

export const getUserSolutionsSortedData = createSelector([getSolutions, getAssignments], (solutions, assignments) =>
  lruMemoize((userId, assignmentId) =>
    assignments
      .getIn(['solutions', assignmentId, userId], EMPTY_LIST)
      .map(id => solutions.get(id))
      .filter(a => a)
      .sort((a, b) => {
        const aTimestamp = a.getIn(['data', 'createdAt']);
        const bTimestamp = b.getIn(['data', 'createdAt']);
        return bTimestamp - aTimestamp;
      })
      .map(getJsData)
  )
);

export const isResubmitAllFetchPending = createSelector(getAssignment, assignment =>
  assignment.getIn(['resubmit-all', 'fetchPending'], false)
);

// yes, this might seem awkward, but we really need only the last pending/failed job
const getResubmitAllLastJob = type =>
  createSelector([getAssignment, getAsyncJobSelector], (assignment, asyncJobsSelector) => {
    const jobId = assignment.getIn(['resubmit-all', type, 0], null);
    return jobId && asyncJobsSelector(jobId);
  });

export const getResubmitAllPendingJob = getResubmitAllLastJob('pending');
export const getResubmitAllFailedJob = getResubmitAllLastJob('failed');

/*
 * Related async jobs
 */

const getAssignmentAsyncJobs = state => getAssignments(state).get('async-jobs');
export const getFetchAssignmentAsyncJobsPending = createSelector(
  [getAssignmentAsyncJobs, getParam],
  (asyncJobs, id) => Boolean(asyncJobs) && asyncJobs.getIn([id, 'pending'], false)
);

export const hasPendingNotificationAsyncJob = createSelector(
  [getAssignmentAsyncJobs, getAsyncJobSelector, getParam],
  (asyncJobs, asyncJobsSelector, id) =>
    Boolean(
      asyncJobs &&
        (asyncJobs.getIn([id, 'ids']) || EMPTY_LIST)
          .map(id => asyncJobsSelector(id))
          .find(
            job =>
              job &&
              isReady(job) &&
              job.getIn(['data', 'finishedAt']) === null &&
              job.getIn(['data', 'command']) === 'assignmentNotification'
          )
    )
);
