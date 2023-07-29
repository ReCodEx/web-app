import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import { downloadHelper } from '../helpers/api/download';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
import { arrayToObject } from '../../helpers/common';

import { additionalActionTypes as solutionsActionTypes } from './solutions';
import { actionTypes as submissionActionTypes } from './submission';
import { additionalActionTypes as additionalReviewsActionTypes } from './solutionReviews';

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
  DOWNLOAD_BEST_SOLUTIONS_ARCHIVE: 'recodex/assignment/DOWNLOAD_BEST_SOLUTIONS_ARCHIVE',
  LOAD_EXERCISE_ASSIGNMENTS: 'recodex/exercises/LOAD_EXERCISE_ASSIGNMENTS',
  LOAD_EXERCISE_ASSIGNMENTS_FULFILLED: 'recodex/exercises/LOAD_EXERCISE_ASSIGNMENTS_FULFILLED',
  ...createActionsWithPostfixes('RESUBMIT_ALL', 'recodex/assignment'),
  ...createActionsWithPostfixes('FETCH_ASYNC_JOBS', 'recodex/assignment'),
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

export const create = (groupId, exerciseId) => actions.addResource({ groupId, exerciseId });
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

export const fetchResubmitAllStatus = assignmentId =>
  createApiAction({
    type: additionalActionTypes.RESUBMIT_ALL,
    method: 'GET',
    endpoint: `/exercise-assignments/${assignmentId}/resubmit-all`,
    meta: { assignmentId },
  });

export const resubmitAllSolutions = assignmentId =>
  createApiAction({
    type: additionalActionTypes.RESUBMIT_ALL,
    method: 'POST',
    endpoint: `/exercise-assignments/${assignmentId}/resubmit-all`,
    meta: { assignmentId },
  });

export const fetchAssignmentAsyncJobs = assignmentId =>
  createApiAction({
    type: additionalActionTypes.FETCH_ASYNC_JOBS,
    method: 'GET',
    endpoint: `/exercise-assignments/${assignmentId}/async-jobs`,
    meta: { assignmentId },
  });
/**
 * Reducer
 */

const solutionsFulfilledReducer = (state, { payload: solutions }) => {
  // sort out the solutions IDs in a organized structure first
  const organizedIds = {};
  solutions.forEach(solution => {
    if (!organizedIds[solution.assignmentId]) {
      organizedIds[solution.assignmentId] = {};
    }
    if (!organizedIds[solution.assignmentId][solution.authorId]) {
      organizedIds[solution.assignmentId][solution.authorId] = [];
    }
    organizedIds[solution.assignmentId][solution.authorId].push(solution.id);
  });

  // use the orgnaized structure to update the state
  Object.keys(organizedIds).forEach(assignmentId => {
    Object.keys(organizedIds[assignmentId]).forEach(authorId => {
      state = state.setIn(['solutions', assignmentId, authorId], fromJS(organizedIds[assignmentId][authorId]));
    });
  });

  return state;
};

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.SYNC_ASSIGNMENT_FULFILLED]: (state, { payload, meta: { assignmentId } }) =>
      state.setIn(['resources', assignmentId, 'data'], fromJS(payload)),

    [additionalActionTypes.LOAD_EXERCISE_ASSIGNMENTS_FULFILLED]: (state, { payload }) =>
      state.mergeIn(
        ['resources'],
        arrayToObject(
          payload,
          ({ id }) => id,
          data => createRecord({ state: resourceStatus.FULFILLED, data })
        )
      ),

    [submissionActionTypes.SUBMIT_FULFILLED]: (state, { payload: { solution }, meta: { submissionType } }) => {
      if (submissionType !== 'assignmentSolution' || !solution || !solution.id) {
        return state;
      }

      if (!state.hasIn(['solutions', solution.assignmentId, solution.authorId])) {
        state = state.setIn(['solutions', solution.assignmentId, solution.authorId], List());
      }

      return state.updateIn(['solutions', solution.assignmentId, solution.authorId], solutions =>
        solutions.push(solution.id)
      );
    },

    [solutionsActionTypes.LOAD_USERS_SOLUTIONS_FULFILLED]: (state, { payload, meta: { userId, assignmentId } }) =>
      state.setIn(['solutions', assignmentId, userId], fromJS(payload.map(solution => solution.id))),

    [solutionsActionTypes.LOAD_ASSIGNMENT_SOLUTIONS_FULFILLED]: solutionsFulfilledReducer,

    [solutionsActionTypes.LOAD_GROUP_STUDENTS_SOLUTIONS_FULFILLED]: solutionsFulfilledReducer,

    [additionalActionTypes.RESUBMIT_ALL_PENDING]: (state, { meta: { assignmentId } }) =>
      state.setIn(['resources', assignmentId, 'resubmit-all', 'fetchPending'], true),

    [additionalActionTypes.RESUBMIT_ALL_REJECTED]: (state, { meta: { assignmentId } }) =>
      state.setIn(['resources', assignmentId, 'resubmit-all', 'fetchPending'], false),

    [additionalActionTypes.RESUBMIT_ALL_FULFILLED]: (state, { payload: { pending, failed }, meta: { assignmentId } }) =>
      state.setIn(
        ['resources', assignmentId, 'resubmit-all'],
        fromJS({
          pending: pending.map(job => job.id),
          failed: failed.map(job => job.id),
          fetchPending: false,
        })
      ),

    [additionalActionTypes.FETCH_ASYNC_JOBS_PENDING]: (state, { meta: { assignmentId } }) =>
      state.setIn(['async-jobs', assignmentId, 'pending'], true).setIn(['async-jobs', assignmentId, 'ids'], null),

    [additionalActionTypes.FETCH_ASYNC_JOBS_REJECTED]: (state, { meta: { assignmentId } }) =>
      state.setIn(['async-jobs', assignmentId, 'pending'], false).setIn(['async-jobs', assignmentId, 'ids'], false),

    [additionalActionTypes.FETCH_ASYNC_JOBS_FULFILLED]: (state, { payload, meta: { assignmentId } }) =>
      state
        .setIn(['async-jobs', assignmentId, 'pending'], false)
        .setIn(['async-jobs', assignmentId, 'ids'], fromJS(payload.map(aj => aj.id))),

    [additionalReviewsActionTypes.FETCH_OPEN_REVIEWS_FULFILLED]: (state, { payload: { assignments } }) =>
      state.update('resources', resources =>
        resources.withMutations(mutable =>
          assignments.reduce(
            (mutable, assignment) =>
              mutable.set(assignment.id, createRecord({ state: resourceStatus.FULFILLED, data: assignment })),
            mutable
          )
        )
      ),
  }),
  initialState
);

export default reducer;
