import { handleActions, createAction } from 'redux-actions';
import { fromJS } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware.js';
import factory, {
  initialState,
  defaultNeedsRefetching,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submission.js';
import { actionTypes as submissionEvaluationActionTypes } from './submissionEvaluations.js';
import {
  actionTypes as reviewsActionTypes,
  additionalActionTypes as additionalReviewsActionTypes,
} from './solutionReviews.js';
import { getAssignmentSolversLastUpdate } from '../selectors/solutions.js';
import { objectFilter } from '../../helpers/common.js';

const resourceName = 'solutions';
const needsRefetching = item =>
  defaultNeedsRefetching(item) || (!item.getIn(['data', 'evaluation']) && !item.getIn(['data', 'failure']));

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
  ...createActionsWithPostfixes('LOAD_USERS_SOLUTIONS', 'recodex/solutions'),
  ...createActionsWithPostfixes('LOAD_ASSIGNMENT_SOLUTIONS', 'recodex/solutions'),
  ...createActionsWithPostfixes('LOAD_GROUP_STUDENTS_SOLUTIONS', 'recodex/solutions'),
  ...createActionsWithPostfixes('SET_NOTE', 'recodex/solutions'),
  ...createActionsWithPostfixes('SET_BONUS_POINTS', 'recodex/solutions'),
  ...createActionsWithPostfixes('SET_FLAG', 'recodex/solutions'),
  ...createActionsWithPostfixes('LOAD_ASSIGNMENT_SOLVERS', 'recodex/solutions'),
  ...createActionsWithPostfixes('FETCH_REVIEW_REQUESTS', 'recodex/solutions'),
  INVALIDATE_ASSIGNMENT_SOLVERS: 'recodex/solutions/INVALIDATE_ASSIGNMENT_SOLVERS',
  DOWNLOAD_RESULT_ARCHIVE: 'recodex/files/DOWNLOAD_RESULT_ARCHIVE',
};

export const fetchSolution = actions.fetchResource;
export const fetchSolutionIfNeeded = actions.fetchOneIfNeeded;
export const deleteSolution = (id, groupId) => actions.removeResource(id, apiEndpointFactory(id), { groupId });

export const setNote = (solutionId, note) =>
  createApiAction({
    type: additionalActionTypes.SET_NOTE,
    endpoint: `/assignment-solutions/${solutionId}`,
    method: 'POST',
    body: { note },
    meta: { solutionId },
  });

export const setPoints = (solutionId, overriddenPoints, bonusPoints) =>
  createApiAction({
    type: additionalActionTypes.SET_BONUS_POINTS,
    endpoint: `/assignment-solutions/${solutionId}/bonus-points`,
    method: 'POST',
    body: { overriddenPoints, bonusPoints },
    meta: { solutionId },
  });

export const setSolutionFlag = (id, flag, value) =>
  createApiAction({
    type: additionalActionTypes.SET_FLAG,
    method: 'POST',
    endpoint: `/assignment-solutions/${id}/set-flag/${flag}`,
    body: { value },
    meta: { id, flag, value },
  });

export const resubmitSolution = (id, isPrivate, progressObserverId = null, isDebug = true) =>
  createApiAction({
    type: submissionActionTypes.SUBMIT,
    method: 'POST',
    endpoint: `/assignment-solutions/${id}/resubmit`,
    body: { private: isPrivate, debug: isDebug },
    meta: { submissionType: 'assignmentSolution', progressObserverId },
  });

export const fetchManyAssignmentSolutionsEndpoint = assignmentId => `/exercise-assignments/${assignmentId}/solutions`;

export const fetchManyUserSolutionsEndpoint = (userId, assignmentId) =>
  `/exercise-assignments/${assignmentId}/users/${userId}/solutions`;

export const fetchManyGroupStudentsSolutionsEndpoint = (groupId, userId) =>
  `/groups/${groupId}/students/${userId}/solutions`;

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

export const fetchGroupStudentsSolutions = (groupId, userId) =>
  actions.fetchMany({
    type: additionalActionTypes.LOAD_GROUP_STUDENTS_SOLUTIONS,
    endpoint: fetchManyGroupStudentsSolutionsEndpoint(groupId, userId),
    meta: {
      groupId,
      userId,
    },
  });

export const fetchAssignmentSolvers = ({ assignmentId = null, groupId = null, userId = null }) =>
  createApiAction({
    type: additionalActionTypes.LOAD_ASSIGNMENT_SOLVERS,
    method: 'GET',
    endpoint: '/assignment-solvers',
    query: objectFilter({ assignmentId, groupId, userId }),
    meta: { assignmentId, groupId, userId },
  });

export const fetchAssignmentSolversIfNeeded =
  ({ assignmentId = null, groupId = null, userId = null }) =>
  (dispatch, getState) => {
    const lastUpdate = getAssignmentSolversLastUpdate(getState(), assignmentId, groupId, userId);
    const threshold = 10 * 60 * 1000; // 10 minutes
    if (!lastUpdate || Date.now() - lastUpdate > threshold) {
      return dispatch(fetchAssignmentSolvers({ assignmentId, groupId, userId }));
    }
  };

export const invalidateAssignmentSolvers = createAction(additionalActionTypes.INVALIDATE_ASSIGNMENT_SOLVERS);

export const fetchReviewRequestsForTeacher = userId =>
  createApiAction({
    type: additionalActionTypes.FETCH_REVIEW_REQUESTS,
    endpoint: `/users/${userId}/review-requests`,
    method: 'GET',
    meta: { userId },
  });

/**
 * Reducer
 */

export const createSolutionsGroupAssignmentIndex = (solutions, assignments) => {
  const agIndex = {};
  const res = {};
  assignments.forEach(assignment => {
    if (assignment.groupId) {
      res[assignment.groupId] = res[assignment.groupId] || {};
      res[assignment.groupId][assignment.id] = res[assignment.groupId][assignment.id] || [];
      agIndex[assignment.id] = assignment.groupId;
    }
  });

  solutions.forEach(solution => {
    const groupId = agIndex[solution.assignmentId];
    if (groupId) {
      res[groupId][solution.assignmentId].push(solution.id);
    }
  });

  return res;
};

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

    [additionalActionTypes.LOAD_GROUP_STUDENTS_SOLUTIONS_PENDING]: reduceActions[actionTypes.FETCH_MANY_PENDING],
    [additionalActionTypes.LOAD_GROUP_STUDENTS_SOLUTIONS_FULFILLED]: reduceActions[actionTypes.FETCH_MANY_FULFILLED],
    [additionalActionTypes.LOAD_GROUP_STUDENTS_SOLUTIONS_REJECTED]: reduceActions[actionTypes.FETCH_MANY_REJECTED],

    [additionalActionTypes.SET_NOTE_FULFILLED]: (state, { payload }) =>
      state.setIn(
        ['resources', payload.id],
        createRecord({
          state: resourceStatus.FULFILLED,
          data: payload,
        })
      ),

    [additionalActionTypes.SET_BONUS_POINTS_PENDING]: (state, { meta: { solutionId } }) =>
      state.setIn(['resources', solutionId, 'pending-points'], true),

    [additionalActionTypes.SET_BONUS_POINTS_REJECTED]: (state, { meta: { solutionId } }) =>
      state.removeIn(['resources', solutionId, 'pending-points']),

    [additionalActionTypes.SET_BONUS_POINTS_FULFILLED]: (state, { meta: { solutionId }, payload }) => {
      state = state.removeIn(['resources', solutionId, 'pending-points']);
      payload.forEach(solution => {
        state = state.setIn(
          ['resources', solution.id],
          createRecord({
            state: resourceStatus.FULFILLED,
            data: solution,
          })
        );
      });
      return state;
    },

    [additionalActionTypes.SET_FLAG_PENDING]: (state, { meta: { id, flag } }) =>
      state.setIn(['resources', id, `pending-set-flag-${flag}`], true),

    [additionalActionTypes.SET_FLAG_REJECTED]: (state, { meta: { id, flag } }) =>
      state.removeIn(['resources', id, `pending-set-flag-${flag}`]),

    [additionalActionTypes.SET_FLAG_FULFILLED]: (state, { payload: { solutions = [] }, meta: { id, flag } }) => {
      state = state.removeIn(['resources', id, `pending-set-flag-${flag}`]);
      solutions.forEach(solution => {
        state = state.setIn(
          ['resources', solution.id],
          createRecord({
            state: resourceStatus.FULFILLED,
            data: solution,
          })
        );
      });
      return state;
    },

    [additionalActionTypes.LOAD_ASSIGNMENT_SOLVERS_PENDING]: state => state.set('assignment-solvers-loading', true),

    [additionalActionTypes.LOAD_ASSIGNMENT_SOLVERS_REJECTED]: state => state.set('assignment-solvers-loading', false),

    [additionalActionTypes.LOAD_ASSIGNMENT_SOLVERS_FULFILLED]: (
      state,
      { payload, meta: { assignmentId, groupId, userId } }
    ) => {
      state = state.set('assignment-solvers-loading', false);
      state = state.setIn(['assignment-solvers-fetches', `${assignmentId}|${groupId}|${userId}`], Date.now());
      payload.forEach(assignmentSolver => {
        state = state.setIn(
          ['assignment-solvers', assignmentSolver.assignmentId, assignmentSolver.solverId],
          fromJS(assignmentSolver)
        );
      });
      return state;
    },

    [additionalActionTypes.INVALIDATE_ASSIGNMENT_SOLVERS]: state => state.delete('assignment-solvers-fetches'),

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

    [reviewsActionTypes.FETCH_FULFILLED]: (state, { meta: { id }, payload: { solution: data } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [reviewsActionTypes.UPDATE_FULFILLED]: (state, { meta: { id }, payload: { solution: data } }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [reviewsActionTypes.REMOVE_FULFILLED]: (state, { meta: { id } }) =>
      state.getIn(['resources', id, 'state']) === resourceStatus.FULFILLED
        ? state.setIn(['resources', id, 'data', 'review'], null)
        : state,

    [additionalReviewsActionTypes.FETCH_OPEN_REVIEWS_FULFILLED]: (state, { payload: { solutions } }) =>
      state.update('resources', resources =>
        resources.withMutations(mutable =>
          solutions.reduce(
            (mutable, solution) =>
              mutable.set(solution.id, createRecord({ state: resourceStatus.FULFILLED, data: solution })),
            mutable
          )
        )
      ),

    [additionalActionTypes.FETCH_REVIEW_REQUESTS_PENDING]: (state, { meta: { userId } }) =>
      state.setIn(['review-requests', userId], resourceStatus.PENDING),

    [additionalActionTypes.FETCH_REVIEW_REQUESTS_REJECTED]: (state, { meta: { userId } }) =>
      state.setIn(['review-requests', userId], resourceStatus.FAILED),

    [additionalActionTypes.FETCH_REVIEW_REQUESTS_FULFILLED]: (
      state,
      { meta: { userId }, payload: { solutions, assignments } }
    ) =>
      state
        .setIn(['review-requests', userId], fromJS(createSolutionsGroupAssignmentIndex(solutions, assignments)))
        .update('resources', resources =>
          resources.withMutations(mutable =>
            solutions.reduce(
              (mutable, solution) =>
                mutable.set(solution.id, createRecord({ state: resourceStatus.FULFILLED, data: solution })),
              mutable
            )
          )
        ),
  }),
  initialState
);

export default reducer;
