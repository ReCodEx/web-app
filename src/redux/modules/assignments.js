import { createAction, handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { usersSelector } from '../selectors/users';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'assignments';
const {
  actions,
  reduceActions
} = factory(resourceName, state => state.groups, id => `/assignments/${id}`);


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
  dispatch =>
    dispatch(createApiAction({
      type: actionTypes.LOAD_GROUPS_ASSINGMENTS,
      endpoint: `/groups/${groupId}/assignments`,
      method: 'GET'
    }))
    .then(({ value }) =>
      value.map(assignment =>
        dispatch(loadAssignment(assignment))));



/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {



}), initialState);

export default reducer;


