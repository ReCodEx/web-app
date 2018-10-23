import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'shadowAssignments';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: (id = '') => `/shadow-assignments/${id}`
});

export { actionTypes };

export const additionalActionTypes = {
  TODO: 'recodex/shadow-assignments/TODO'
};

/**
 * Actions
 */

export const loadShadowAssignment = actions.pushResource;
export const fetchShadowAssignment = actions.fetchResource;
export const fetchShadowAssignmentIfNeeded = actions.fetchOneIfNeeded;

export const fetchShadowAssignmentsForGroup = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/shadow-assignments`
  });

export const createShadowAssignment = groupId =>
  actions.addResource({ groupId });
export const editShadowAssignment = actions.updateResource;
export const deleteShadowAssignment = actions.removeResource;

/*
export const validateAssignment = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_ASSIGNMENT,
    endpoint: `/exercise-assignments/${id}/validate`,
    method: 'POST',
    body: { version }
  });
*/

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign(
    {},
    reduceActions,
    {
      // TODO
    }
  ),
  initialState
);

export default reducer;