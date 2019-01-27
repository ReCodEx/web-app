import { createSelector } from 'reselect';
import { EMPTY_LIST } from '../../helpers/common';
import { getSolutions } from './solutions';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';
import { isReady } from '../helpers/resourceManager';

export const getAssignments = state => state.assignments;

const getAssignmentResources = state => getAssignments(state).get('resources');

export const getAssignment = createSelector(
  getAssignmentResources,
  assignments => id => assignments.get(id)
);

export const getExerciseAssignments = createSelector(
  [getAssignmentResources, (state, exerciseId) => exerciseId],
  (assignments, exerciseId) =>
    assignments.filter(
      assignment =>
        isReady(assignment) &&
        assignment.getIn(['data', 'exerciseId']) === exerciseId
    )
);

export const assignmentEnvironmentsSelector = createSelector(
  [getAssignment, runtimeEnvironmentSelector],
  (assignmentSelector, envSelector) => id => {
    const assignment = assignmentSelector(id);
    const envIds =
      assignment && assignment.getIn(['data', 'runtimeEnvironmentIds']);
    const disabledEnvIds =
      assignment && assignment.getIn(['data', 'disabledRuntimeEnvironmentIds']);
    return envIds && disabledEnvIds && envSelector
      ? envIds
          .toArray()
          .filter(env => disabledEnvIds.toArray().indexOf(env) < 0)
          .map(envSelector)
      : null;
  }
);

export const getUserSolutions = (userId, assignmentId) =>
  createSelector([getSolutions, getAssignments], (solutions, assignments) => {
    const assignmentSolutions = assignments.getIn([
      'solutions',
      assignmentId,
      userId
    ]);
    if (!assignmentSolutions) {
      return EMPTY_LIST;
    }

    return assignmentSolutions.map(id => solutions.get(id)).filter(a => a);
  });

export const isResubmitAllPending = assignmentId =>
  createSelector(getAssignment, assignmentSelector => {
    const assignment = assignmentSelector(assignmentId);
    return assignment.getIn(['data', 'resubmit-all-pending'], false);
  });
