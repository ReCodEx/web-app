import { handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, {
  initialState,
  defaultNeedsRefetching
} from '../helpers/resourceManager';

const resourceName = 'submissions';
const needsRefetching = (item) =>
  defaultNeedsRefetching(item) || item.getIn(['data', 'evaluationStatus']) === 'work-in-progress';

const {
  actions,
  actionTypes,
  reduceActions
} = factory({ resourceName, needsRefetching });

/**
 * Actions
 */

export const additionalActionTypes = {
  LOAD_USERS_SUBMISSIONS: 'recodex/submissions/LOAD_USERS_SUBMISSIONS',
  LOAD_USERS_SUBMISSIONS_PENDING: 'recodex/submissions/LOAD_USERS_SUBMISSIONS_PENDING',
  LOAD_USERS_SUBMISSIONS_FULFILLED: 'recodex/submissions/LOAD_USERS_SUBMISSIONS_FULFILLED',
  LOAD_USERS_SUBMISSIONS_FAILED: 'recodex/submissions/LOAD_USERS_SUBMISSIONS_FAILED',
  SET_BONUS_POINTS: 'recodex/submissions/SET_BONUS_POINTS',
  SET_BONUS_POINTS_PENDING: 'recodex/submissions/SET_BONUS_POINTS_PENDING',
  SET_BONUS_POINTS_FULFILLED: 'recodex/submissions/SET_BONUS_POINTS_FULFILLED',
  SET_BONUS_POINTS_FAILED: 'recodex/submissions/SET_BONUS_POINTS_FAILED'
};

export const loadSubmissionData = actions.pushResource;
export const fetchSubmission = actions.fetchResource;
export const fetchSubmissionIfNeeded = actions.fetchOneIfNeeded;

export const setPoints = (submissionId, bonusPoints) =>
  createApiAction({
    type: additionalActionTypes.SET_BONUS_POINTS,
    endpoint: `/submissions/${submissionId}`,
    method: 'POST',
    body: { bonusPoints },
    meta: { submissionId, bonusPoints }
  });

export const fetchUsersSubmissions = (userId, assignmentId) =>
  actions.fetchMany({
    type: additionalActionTypes.LOAD_USERS_SUBMISSIONS,
    endpoint: `/exercise-assignments/${assignmentId}/users/${userId}/submissions`,
    meta: {
      assignmentId,
      userId
    }
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [additionalActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]: reduceActions[actionTypes.FETCH_MANY_FULFILLED],

  [additionalActionTypes.SET_BONUS_POINTS_FULFILLED]: (state, { meta: { submissionId, bonusPoints } }) =>
    state.setIn(['resources', submissionId, 'data', 'evaluation', 'bonusPoints'], Number(bonusPoints))

}), initialState);

export default reducer;
