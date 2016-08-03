import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState, createRecord } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { actionTypes as submissionsActionTypes } from './submissions';

const resourceName = 'assignments';
const {
  actions,
  reduceActions
} = factory(resourceName, state => state.groups, id => `/exercise-assignments/${id}`);

const actionTypes = {
  LOAD_GROUPS_ASSINGMENTS: 'recodex/assignments/LOAD_GROUPS_ASSINGMENTS',
  LOAD_GROUPS_ASSINGMENTS_PENDING: 'recodex/assignments/LOAD_GROUPS_ASSINGMENTS_PENDING',
  LOAD_GROUPS_ASSINGMENTS_FULFILLED: 'recodex/assignments/LOAD_GROUPS_ASSINGMENTS_FULFILLED',
  LOAD_GROUPS_ASSINGMENTS_FAILED: 'recodex/assignments/LOAD_GROUPS_ASSINGMENTS_FAILED'
};

/**
 * Actions
 */

export const loadAssignment = actions.pushResource;
export const fetchAssignmentssIfNeeded = actions.fetchIfNeeded;
export const fetchAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchAssignmentsForGroup = groupId =>
  createApiAction({
    type: actionTypes.LOAD_GROUPS_ASSINGMENTS,
    endpoint: `/groups/${groupId}/assignments`,
    method: 'GET'
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [actionTypes.LOAD_GROUPS_ASSINGMENTS_FULFILLED]: (state, { payload }) =>
    payload.reduce((state, assignment) =>
      state.setIn([ 'resources', assignment.id ], createRecord(false, false, false, assignment)), state),

  [submissionsActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]: (state, { payload, meta: { userId, assignmentId } }) =>
    state.setIn([ 'submissions', assignmentId, userId ], payload.map(submission => submission.id))

}), initialState);

export default reducer;

