import { handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, {
  initialState,
  defaultNeedsRefetching
} from '../helpers/resourceManager';
import { actionTypes as submissionActionTypes } from './submission';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'submissions';
const needsRefetching = item =>
  defaultNeedsRefetching(item) ||
  item.getIn(['data', 'evaluationStatus']) === 'work-in-progress';

const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  needsRefetching
});

/**
 * Actions
 */

export const additionalActionTypes = {
  LOAD_USERS_SUBMISSIONS: 'recodex/submissions/LOAD_USERS_SUBMISSIONS',
  LOAD_USERS_SUBMISSIONS_PENDING:
    'recodex/submissions/LOAD_USERS_SUBMISSIONS_PENDING',
  LOAD_USERS_SUBMISSIONS_FULFILLED:
    'recodex/submissions/LOAD_USERS_SUBMISSIONS_FULFILLED',
  LOAD_USERS_SUBMISSIONS_FAILED:
    'recodex/submissions/LOAD_USERS_SUBMISSIONS_FAILED',
  SET_BONUS_POINTS: 'recodex/submissions/SET_BONUS_POINTS',
  SET_BONUS_POINTS_PENDING: 'recodex/submissions/SET_BONUS_POINTS_PENDING',
  SET_BONUS_POINTS_FULFILLED: 'recodex/submissions/SET_BONUS_POINTS_FULFILLED',
  SET_BONUS_POINTS_FAILED: 'recodex/submissions/SET_BONUS_POINTS_FAILED',
  ACCEPT: 'recodex/submissions/ACCEPT',
  ACCEPT_PENDING: 'recodex/submissions/ACCEPT_PENDING',
  ACCEPT_FULFILLED: 'recodex/submissions/ACCEPT_FULFILLED',
  ACCEPT_FAILED: 'recodex/submissions/ACCEPT_FAILED',
  UNACCEPT: 'recodex/submissions/UNACCEPT',
  UNACCEPT_PENDING: 'recodex/submissions/UNACCEPT_PENDING',
  UNACCEPT_FULFILLED: 'recodex/submissions/UNACCEPT_FULFILLED',
  UNACCEPT_FAILED: 'recodex/submissions/UNACCEPT_FAILED',
  RESUBMIT_ALL: 'recodex/submissions/RESUBMIT_ALL',
  DOWNLOAD_RESULT_ARCHIVE: 'recodex/files/DOWNLOAD_RESULT_ARCHIVE'
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

export const acceptSubmission = id =>
  createApiAction({
    type: additionalActionTypes.ACCEPT,
    method: 'POST',
    endpoint: `/submissions/${id}/set-accepted`,
    meta: { id }
  });

export const unacceptSubmission = id =>
  createApiAction({
    type: additionalActionTypes.UNACCEPT,
    method: 'DELETE',
    endpoint: `/submissions/${id}/unset-accepted`,
    meta: { id }
  });

export const resubmitSubmission = (id, isPrivate, isDebug = true) =>
  createApiAction({
    type: submissionActionTypes.SUBMIT,
    method: 'POST',
    endpoint: `/submissions/${id}/resubmit`,
    body: { private: isPrivate, debug: isDebug },
    meta: { id }
  });

export const resubmitAllSubmissions = assignmentId =>
  createApiAction({
    type: additionalActionTypes.RESUBMIT_ALL,
    method: 'POST',
    endpoint: `/exercise-assignments/${assignmentId}/resubmit-all`,
    meta: { assignmentId }
  });

export const fetchUsersSubmissions = (userId, assignmentId) =>
  actions.fetchMany({
    type: additionalActionTypes.LOAD_USERS_SUBMISSIONS,
    endpoint: `/exercise-assignments/${assignmentId}/users/${userId}/solutions`,
    meta: {
      assignmentId,
      userId
    }
  });

export const downloadResultArchive = downloadHelper({
  endpoint: id => `/submissions/evaluation/${id}/download-result`,
  fetch: fetchSubmissionIfNeeded,
  actionType: additionalActionTypes.DOWNLOAD_RESULT_ARCHIVE,
  fileNameSelector: (id, state) => `${id}.zip`,
  contentType: 'application/zip'
});

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]:
      reduceActions[actionTypes.FETCH_MANY_FULFILLED],

    [additionalActionTypes.SET_BONUS_POINTS_FULFILLED]: (
      state,
      { meta: { submissionId, bonusPoints } }
    ) =>
      state.setIn(
        ['resources', submissionId, 'data', 'evaluation', 'bonusPoints'],
        Number(bonusPoints)
      ),

    [additionalActionTypes.ACCEPT_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], true),

    [additionalActionTypes.ACCEPT_FAILED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], false),

    [additionalActionTypes.ACCEPT_FULFILLED]: (state, { meta: { id } }) =>
      state.update('resources', resources =>
        resources.map(
          (item, itemId) =>
            item.get('data') !== null
              ? item.update(
                  'data',
                  data =>
                    itemId === id
                      ? data
                          .set('accepted', true)
                          .set('accepted-pending', false)
                      : data
                          .set('accepted', false)
                          .set('accepted-pending', false)
                )
              : item
        )
      ),
    [additionalActionTypes.UNACCEPT_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], true),

    [additionalActionTypes.UNACCEPT_FAILED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'data', 'accepted-pending'], false),

    [additionalActionTypes.UNACCEPT_FULFILLED]: (state, { meta: { id } }) =>
      state.update('resources', resources =>
        resources.map(
          (item, itemId) =>
            item.get('data') !== null
              ? item.update(
                  'data',
                  data =>
                    itemId === id
                      ? data
                          .set('accepted', false)
                          .set('accepted-pending', false)
                      : data
                          .set('accepted', true)
                          .set('accepted-pending', false)
                )
              : item
        )
      )
  }),
  initialState
);

export default reducer;
