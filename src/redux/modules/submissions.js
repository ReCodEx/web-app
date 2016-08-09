import { createAction, handleActions } from 'redux-actions';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, {
  createRecord,
  initialState,
  defaultNeedsRefetching
} from '../helpers/resourceManager';

const resourceName = 'submissions';
const needsRefetching = (item) =>
  defaultNeedsRefetching(item) || item.data.evaluationStatus === 'work-in-progress';

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
  LOAD_USERS_SUBMISSIONS_FAILED: 'recodex/submissions/LOAD_USERS_SUBMISSIONS_FAILED'
};

export const loadSubmissionData = actions.pushResource;
export const fetchSubmission = actions.fetchResource;
export const fetchSubmissionIfNeeded = actions.fetchOneIfNeeded;

export const fetchUsersSubmissions = (userId, assignmentId) =>
  createApiAction({
    type: additionalActionTypes.LOAD_USERS_SUBMISSIONS,
    endpoint: `/exercise-assignments/${assignmentId}/users/${userId}/submissions`,
    method: 'GET',
    meta: {
      assignmentId,
      userId
    }
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [additionalActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]: (state, { payload }) => {
    const records = payload.map(submission => createRecord(false, false, false, submission));
    return records.reduce(
      (state, record) =>
        state.setIn([ 'resources', record.data.id ], record),
      state
    );
  }

}), initialState);

export default reducer;
