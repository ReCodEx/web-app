import { handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';
import createRecord from '../helpers/resourceManager/recordFactory';
import { resourceStatus } from '../helpers/resourceManager/status';
import { defaultNeedsRefetching } from '../helpers/resourceManager/utils';
import { subId } from '../selectors/exerciseScoreConfig';

/**
 * Create basic actions
 */

const resourceName = 'exerciseScoreConfig';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/score-config`,
});

export const fetchScoreConfig = actions.fetchResource;
export const fetchScoreConfigIfNeeded = actions.fetchOneIfNeeded;
export const setScoreConfig = actions.updateResource;

/**
 * Additional actions (handling assignment and reference submission score configs)
 */
export const additionalActionTypes = {
  FETCH_SUBMISSION_SCORE_CONFIG: 'recodex/exerciseScoreConfig/FETCH_SUBMISSION_SCORE_CONFIG',
  FETCH_SUBMISSION_SCORE_CONFIG_PENDING: 'recodex/exerciseScoreConfig/FETCH_SUBMISSION_SCORE_CONFIG_PENDING',
  FETCH_SUBMISSION_SCORE_CONFIG_FULFILLED: 'recodex/exerciseScoreConfig/FETCH_SUBMISSION_SCORE_CONFIG_FULFILLED',
  FETCH_SUBMISSION_SCORE_CONFIG_REJECTED: 'recodex/exerciseScoreConfig/FETCH_SUBMISSION_SCORE_CONFIG_REJECTED',
};

const fetchSubmissionScoreConfig = (submissionId, type) =>
  createApiAction({
    type: additionalActionTypes.FETCH_SUBMISSION_SCORE_CONFIG,
    endpoint: `/${type}-solutions/evaluation/${submissionId}/score-config`,
    method: 'GET',
    meta: { submissionId, type },
  });

export const fetchAssignmentSubmissionScoreConfig = submissionId =>
  fetchSubmissionScoreConfig(submissionId, 'assignment');
export const fetchReferenceSubmissionScoreConfig = submissionId =>
  fetchSubmissionScoreConfig(submissionId, 'reference');

const fetchSubmissionScoreConfigIfNeeded = (submissionId, type) => (dispatch, getState) => {
  const state = getState()[resourceName];
  const item = state && state.getIn(['resources', subId(submissionId, type)]);
  if (defaultNeedsRefetching(item)) {
    return dispatch(fetchSubmissionScoreConfig(submissionId, type));
  }

  return Promise.resolve();
};

export const fetchAssignmentSubmissionScoreConfigIfNeeded = submissionId =>
  fetchSubmissionScoreConfigIfNeeded(submissionId, 'assignment');
export const fetchReferenceSubmissionScoreConfigIfNeeded = submissionId =>
  fetchSubmissionScoreConfigIfNeeded(submissionId, 'reference');

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [additionalActionTypes.FETCH_SUBMISSION_SCORE_CONFIG]: (state, { meta: { submissionId, type } }) =>
      state.getIn(['resources', subId(submissionId, type), 'state']) === resourceStatus.FULFILLED
        ? state.setIn(['resources', subId(submissionId, type), 'state'], resourceStatus.RELOADING)
        : state.setIn(['resources', subId(submissionId, type)], createRecord()),

    [additionalActionTypes.FETCH_SUBMISSION_SCORE_CONFIG_REJECTED]: (state, { meta: { submissionId, type } }) =>
      state.setIn(['resources', subId(submissionId, type)], createRecord({ state: resourceStatus.FAILED })),

    [additionalActionTypes.FETCH_SUBMISSION_SCORE_CONFIG_FULFILLED]: (
      state,
      { meta: { submissionId, type }, payload: data }
    ) => state.setIn(['resources', subId(submissionId, type)], createRecord({ state: resourceStatus.FULFILLED, data })),
  }),
  initialState
);

export default reducer;
