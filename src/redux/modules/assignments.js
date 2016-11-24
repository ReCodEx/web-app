import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

import factory, { initialState } from '../helpers/resourceManager';
import { additionalActionTypes as submissionsActionTypes } from './submissions';

const resourceName = 'assignments';
const {
  actions,
  actionTypes,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (id = '') => `/exercise-assignments/${id}`
});

export { actionTypes };

/**
 * Actions
 */

export const loadAssignment = actions.pushResource;
export const fetchAssignmentssIfNeeded = actions.fetchIfNeeded;
export const fetchAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchAssignmentsForGroup = (groupId) =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/assignments`
  });

export const create = (groupId, exerciseId) => actions.addResource({ groupId, exerciseId });
export const editAssignment = actions.updateResource;
export const deleteAssignment = actions.removeResource;

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  [submissionsActionTypes.LOAD_USERS_SUBMISSIONS_FULFILLED]: (state, { payload, meta: { userId, assignmentId } }) =>
    state.setIn([ 'submissions', assignmentId, userId ], fromJS(payload.map(submission => submission.id)))

}), initialState);

export default reducer;

