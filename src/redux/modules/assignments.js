import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import { downloadHelper } from '../helpers/api/download';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
} from '../helpers/resourceManager';
import { arrayToObject } from '../../helpers/common';

import { additionalActionTypes as solutionsActionTypes } from './solutions';
import { actionTypes as submissionActionTypes } from './submission';

const resourceName = 'assignments';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: (id = '') => `/exercise-assignments/${id}`,
});

export { actionTypes };

export const additionalActionTypes = {
  VALIDATE_ASSIGNMENT: 'recodex/assignment/VALIDATE',
  SYNC_ASSIGNMENT: 'recodex/assignment/SYNC_ASSIGNMENT',
  SYNC_ASSIGNMENT_PENDING: 'recodex/assignment/SYNC_ASSIGNMENT_PENDING',
  SYNC_ASSIGNMENT_FULFILLED: 'recodex/assignment/SYNC_ASSIGNMENT_FULFILLED',
  DOWNLOAD_BEST_SOLUTIONS_ARCHIVE:
    'recodex/assignment/DOWNLOAD_BEST_SOLUTIONS_ARCHIVE',
  LOAD_EXERCISE_ASSIGNMENTS: 'recodex/exercises/LOAD_EXERCISE_ASSIGNMENTS',
  LOAD_EXERCISE_ASSIGNMENTS_FULFILLED:
    'recodex/exercises/LOAD_EXERCISE_ASSIGNMENTS_FULFILLED',
};

/**
 * Actions
 */

export const loadAssignment = actions.pushResource;
export const fetchAssignment = actions.fetchResource;
export const fetchAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchAssignmentsForGroup = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/assignments`,
  });

export const create = (groupId, exerciseId) =>
  actions.addResource({ groupId, exerciseId });
export const editAssignment = actions.updateResource;
export const deleteAssignment = actions.removeResource;

export const validateAssignment = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_ASSIGNMENT,
    endpoint: `/exercise-assignments/${id}/validate`,
    method: 'POST',
    body: { version },
  });

export const syncWithExercise = assignmentId =>
  createApiAction({
    type: additionalActionTypes.SYNC_ASSIGNMENT,
    endpoint: `/exercise-assignments/${assignmentId}/sync-exercise`,
    method: 'POST',
    meta: { assignmentId },
  });

export const downloadBestSolutionsArchive = downloadHelper({
  actionType: additionalActionTypes.DOWNLOAD_BEST_SOLUTIONS_ARCHIVE,
  fetch: null,
  endpoint: id => `/exercise-assignments/${id}/download-best-solutions`,
  contentType: 'application/zip',
});

export const fetchExerciseAssignments = exerciseId =>
  createApiAction({
    type: additionalActionTypes.LOAD_EXERCISE_ASSIGNMENTS,
    method: 'GET',
    endpoint: `/exercises/${exerciseId}/assignments`,
    meta: { exerciseId },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.SYNC_ASSIGNMENT_FULFILLED]: (
      state,
      { payload, meta: { assignmentId } }
    ) => state.setIn(['resources', assignmentId, 'data'], fromJS(payload)),

    [additionalActionTypes.LOAD_EXERCISE_ASSIGNMENTS_FULFILLED]: (
      state,
      { payload }
    ) =>
      state.mergeIn(
        ['resources'],
        arrayToObject(
          payload,
          ({ id }) => id,
          data => createRecord({ state: resourceStatus.FULFILLED, data })
        )
      ),

    [submissionActionTypes.SUBMIT_FULFILLED]: (
      state,
      { payload: { solution }, meta: { submissionType } }
    ) => {
      if (
        submissionType !== 'assignmentSolution' ||
        !solution ||
        !solution.id
      ) {
        return state;
      }

      if (
        !state.hasIn([
          'solutions',
          solution.exerciseAssignmentId,
          solution.solution.userId,
        ])
      ) {
        state = state.setIn(
          [
            'solutions',
            solution.exerciseAssignmentId,
            solution.solution.userId,
          ],
          List()
        );
      }

      return state.updateIn(
        ['solutions', solution.exerciseAssignmentId, solution.solution.userId],
        solutions => solutions.push(solution.id)
      );
    },

    [solutionsActionTypes.LOAD_USERS_SOLUTIONS_FULFILLED]: (
      state,
      { payload, meta: { userId, assignmentId } }
    ) =>
      state.setIn(
        ['solutions', assignmentId, userId],
        fromJS(payload.map(solution => solution.id))
      ),

    [solutionsActionTypes.LOAD_ASSIGNMENT_SOLUTIONS_FULFILLED]: (
      state,
      { payload, meta: { assignmentId } }
    ) => {
      payload.forEach(function(solution) {
        if (
          !state.hasIn(['solutions', assignmentId, solution.solution.userId])
        ) {
          state = state.setIn(
            ['solutions', assignmentId, solution.solution.userId],
            List()
          );
        }

        state = state.updateIn(
          ['solutions', assignmentId, solution.solution.userId],
          solutions => {
            if (!solutions.includes(solution.id)) {
              return solutions.push(solution.id);
            }
            return solutions;
          }
        );
      });

      return state;
    },

    [solutionsActionTypes.RESUBMIT_ALL_PENDING]: (
      state,
      { meta: { assignmentId } }
    ) =>
      state.setIn(
        ['resources', assignmentId, 'data', 'resubmit-all-pending'],
        true
      ),

    [solutionsActionTypes.RESUBMIT_ALL_REJECTED]: (
      state,
      { meta: { assignmentId } }
    ) =>
      state.setIn(
        ['resources', assignmentId, 'data', 'resubmit-all-pending'],
        false
      ),

    [solutionsActionTypes.RESUBMIT_ALL_FULFILLED]: (
      state,
      { meta: { assignmentId } }
    ) =>
      state.setIn(
        ['resources', assignmentId, 'data', 'resubmit-all-pending'],
        false
      ),
  }),
  initialState
);

export default reducer;
