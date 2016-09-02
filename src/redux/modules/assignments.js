import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { additionalActionTypes as submissionsActionTypes } from './submissions';

const resourceName = 'assignments';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: id => `/exercise-assignments/${id}`
});

/**
 * Actions
 */

export const loadAssignment = actions.pushResource;
export const fetchAssignmentssIfNeeded = actions.fetchIfNeeded;
export const fetchAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchAssignmentsForGroup = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/assignments`
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [submissionsActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]: (state, { payload, meta: { userId, assignmentId } }) =>
    state.setIn([ 'submissions', assignmentId, userId ], fromJS(payload.map(submission => submission.id)))

}), initialState);

export default reducer;

