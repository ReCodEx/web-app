import { handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, {
  initialState,
  defaultNeedsRefetching,
  createRecord,
  resourceStatus,
} from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submission';
import { actionTypes as submissionEvaluationActionTypes } from './submissionEvaluations';

const resourceName = 'solutions';
const needsRefetching = item =>
  defaultNeedsRefetching(item) || item.getIn(['data', 'evaluationStatus']) === 'work-in-progress';

const apiEndpointFactory = id => `/assignment-solutions/${id}`;
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory,
  needsRefetching,
});

/**
 * Actions
 */
export { actionTypes };
export const additionalActionTypes = {
  LOAD_USERS_SOLUTIONS: 'recodex/solutions/LOAD_USERS_SOLUTIONS',
  LOAD_USERS_SOLUTIONS_PENDING: 'recodex/solutions/LOAD_USERS_SOLUTIONS_PENDING',
  LOAD_USERS_SOLUTIONS_FULFILLED: 'recodex/solutions/LOAD_USERS_SOLUTIONS_FULFILLED',
  LOAD_USERS_SOLUTIONS_REJECTED: 'recodex/solutions/LOAD_USERS_SOLUTIONS_REJECTED',
  LOAD_ASSIGNMENT_SOLUTIONS: 'recodex/solutions/LOAD_ASSIGNMENT_SOLUTIONS',
  LOAD_ASSIGNMENT_SOLUTIONS_PENDING: 'recodex/solutions/LOAD_ASSIGNMENT_SOLUTIONS_PENDING',
  LOAD_ASSIGNMENT_SOLUTIONS_FULFILLED: 'recodex/solutions/LOAD_ASSIGNMENT_SOLUTIONS_FULFILLED',
  LOAD_ASSIGNMENT_SOLUTIONS_REJECTED: 'recodex/solutions/LOAD_ASSIGNMENT_SOLUTIONS_REJECTED',
  SET_BONUS_POINTS: 'recodex/solutions/SET_BONUS_POINTS',
  SET_BONUS_POINTS_PENDING: 'recodex/solutions/SET_BONUS_POINTS_PENDING',
  SET_BONUS_POINTS_FULFILLED: 'recodex/solutions/SET_BONUS_POINTS_FULFILLED',
  SET_BONUS_POINTS_REJECTED: 'recodex/solutions/SET_BONUS_POINTS_REJECTED',
  ACCEPT: 'recodex/solutions/ACCEPT',
  ACCEPT_PENDING: 'recodex/solutions/ACCEPT_PENDING',
  ACCEPT_FULFILLED: 'recodex/solutions/ACCEPT_FULFILLED',
  ACCEPT_REJECTED: 'recodex/solutions/ACCEPT_REJECTED',
  UNACCEPT: 'recodex/solutions/UNACCEPT',
  UNACCEPT_PENDING: 'recodex/solutions/UNACCEPT_PENDING',
  UNACCEPT_FULFILLED: 'recodex/solutions/UNACCEPT_FULFILLED',
  UNACCEPT_REJECTED: 'recodex/solutions/UNACCEPT_REJECTED',
  RESUBMIT_ALL: 'recodex/solutions/RESUBMIT_ALL',
  RESUBMIT_ALL_PENDING: 'recodex/solutions/RESUBMIT_ALL_PENDING',
  RESUBMIT_ALL_FULFILLED: 'recodex/solutions/RESUBMIT_ALL_FULFILLED',
  RESUBMIT_ALL_REJECTED: 'recodex/solutions/RESUBMIT_ALL_REJECTED',
  DOWNLOAD_RESULT_ARCHIVE: 'recodex/files/DOWNLOAD_RESULT_ARCHIVE',
};

export const fetchSolution = actions.fetchResource;
export const fetchSolutionIfNeeded = actions.fetchOneIfNeeded;
export const deleteSolution = (id, groupId) => actions.removeResource(id, apiEndpointFactory(id), { groupId });

export const setPoints = (solutionId, overriddenPoints, bonusPoints) =>
  createApiAction({
    type: additionalActionTypes.SET_BONUS_POINTS,
    endpoint: `/assignment-solutions/${solutionId}/bonus-points`,
    method: 'POST',
    body: { overriddenPoints, bonusPoints },
    meta: { solutionId, overriddenPoints, bonusPoints },
  });

export const acceptSolution = id =>
  createApiAction({
    type: additionalActionTypes.ACCEPT,
    method: 'POST',
    endpoint: `/assignment-solutions/${id}/set-accepted`,
    meta: { id },
  });

export const unacceptSolution = id =>
  createApiAction({
    type: additionalActionTypes.UNACCEPT,
    method: 'DELETE',
    endpoint: `/assignment-solutions/${id}/unset-accepted`,
    meta: { id },
  });

export const resubmitSolution = (id, isPrivate, progressObserverId = null, isDebug = true) =>
  createApiAction({
    type: submissionActionTypes.SUBMIT,
    method: 'POST',
    endpoint: `/assignment-solutions/${id}/resubmit`,
    body: { private: isPrivate, debug: isDebug },
    meta: { submissionType: 'assignmentSolution', progressObserverId },
  });

export const resubmitAllSolutions = assignmentId =>
  createApiAction({
    type: additionalActionTypes.RESUBMIT_ALL,
    method: 'POST',
    endpoint: `/exercise-assignments/${assignmentId}/resubmit-all`,
    meta: { assignmentId },
  });

export const fetchManyAssignmentSolutionsEndpoint = assignmentId => `/exercise-assignments/${assignmentId}/solutions`;

export const fetchManyUserSolutionsEndpoint = (userId, assignmentId) =>
  `/exercise-assignments/${assignmentId}/users/${userId}/solutions`;

export const fetchAssignmentSolutions = assignmentId =>
  actions.fetchMany({
    type: additionalActionTypes.LOAD_ASSIGNMENT_SOLUTIONS,
    endpoint: fetchManyAssignmentSolutionsEndpoint(assignmentId),
    meta: {
      assignmentId,
    },
  });

export const fetchUsersSolutions = (userId, assignmentId) =>
  actions.fetchMany({
    type: additionalActionTypes.LOAD_USERS_SOLUTIONS,
    endpoint: fetchManyUserSolutionsEndpoint(userId, assignmentId),
    meta: {
      assignmentId,
      userId,
    },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [submissionActionTypes.SUBMIT_FULFILLED]: (state, { payload: { solution }, meta: { submissionType } }) =>
      submissionType === 'assignmentSolution' && solution && solution.id
        ? state.setIn(
            ['resources', solution.id],
            createRecord({
              state: resourceStatus.FULFILLED,
              data: solution,
            })
          )
        : state,

    [additionalActionTypes.LOAD_USERS_SOLUTIONS_PENDING]: reduceActions[actionTypes.FETCH_MANY_PENDING],
    [additionalActionTypes.LOAD_USERS_SOLUTIONS_FULFILLED]: reduceActions[actionTypes.FETCH_MANY_FULFILLED],
    [additionalActionTypes.LOAD_USERS_SOLUTIONS_REJECTED]: reduceActions[actionTypes.FETCH_MANY_REJECTED],

    [additionalActionTypes.LOAD_ASSIGNMENT_SOLUTIONS_PENDING]: reduceActions[actionTypes.FETCH_MANY_PENDING],
    [additionalActionTypes.LOAD_ASSIGNMENT_SOLUTIONS_FULFILLED]: reduceActions[actionTypes.FETCH_MANY_FULFILLED],
    [additionalActionTypes.LOAD_ASSIGNMENT_SOLUTIONS_REJECTED]: reduceActions[actionTypes.FETCH_MANY_REJECTED],

    [additionalActionTypes.SET_BONUS_POINTS_FULFILLED]: (
      state,
      { meta: { solutionId, overriddenPoints, bonusPoints } }
    ) =>
      state
        .setIn(['resources', solutionId, 'data', 'bonusPoints'], Number(bonusPoints))
        .setIn(
          ['resources', solutionId, 'data', 'overriddenPoints'],
          overriddenPoints !== null ? Number(overriddenPoints) : null
        ),

    [additionalActionTypes.ACCEPT_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], true),

    [additionalActionTypes.ACCEPT_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], false),

    [additionalActionTypes.ACCEPT_FULFILLED]: (state, { meta: { id } }) => {
      const assignmentId = state.getIn(['resources', id, 'data', 'exerciseAssignmentId']);
      const userId = state.getIn(['resources', id, 'data', 'solution', 'userId']);
      // Accepted solution needs to be updated
      state = state.updateIn(['resources', id, 'data'], data =>
        data
          .set('accepted', true)
          .set('isBestSolution', true) // accepted also becomes best solution
          .set('accepted-pending', false)
      );

      return !assignmentId || !userId
        ? state
        : state
            // All other solutions from the same assignment by the same author needs to be updated
            .update('resources', resources =>
              resources.map((item, itemId) => {
                const aId = item.getIn(['data', 'exerciseAssignmentId']);
                const uId = item.getIn(['data', 'solution', 'userId']);
                return itemId === id || aId !== assignmentId || uId !== userId
                  ? item // no modification (either it is accepted solution, or it is solution from another assignment/by another user)
                  : item.update('data', data => data.set('accepted', false).set('isBestSolution', false)); // no other solution can be accepted nor best
              })
            );
    },

    [additionalActionTypes.UNACCEPT_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], true),

    [additionalActionTypes.UNACCEPT_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], false),

    [additionalActionTypes.UNACCEPT_FULFILLED]: (state, { payload: { assignments }, meta: { id } }) => {
      const assignmentId = state.getIn(['resources', id, 'data', 'exerciseAssignmentId']);
      const assignmentStats = assignments.find(a => a.id === assignmentId);
      const newBestSolutionId = assignmentStats && assignmentStats.bestSolutionId;
      state = state.updateIn(['resources', id, 'data'], data =>
        data
          .set('accepted', false)
          .set('isBestSolution', false)
          .set('accepted-pending', false)
      );
      return newBestSolutionId && state.hasIn(['resources', newBestSolutionId, 'data', 'isBestSolution'])
        ? state.setIn(['resources', newBestSolutionId, 'data', 'isBestSolution'], true)
        : state;
    },

    [submissionEvaluationActionTypes.REMOVE_FULFILLED]: (state, { meta: { solutionId, id: evaluationId } }) => {
      if (!solutionId || !evaluationId) {
        return state;
      }

      // Remove the submit from internal list
      const newState = state.updateIn(['resources', solutionId, 'data', 'submissions'], submissions =>
        submissions.filter(submission => submission !== evaluationId)
      );

      // If last submit was deleted, this whole entity is invalid (needs reloading)
      return state.getIn(['resources', solutionId, 'data', 'lastSubmission', 'id']) === evaluationId
        ? newState.setIn(['resources', solutionId, 'didInvalidate'], true)
        : newState;
    },
  }),
  initialState
);

export default reducer;
