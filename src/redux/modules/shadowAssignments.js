import { handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

import { createApiAction } from '../middleware/apiMiddleware';
import { downloadHelper } from '../helpers/api/download';
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

export const fetchAssignmentsForGroup = groupId =>
  actions.fetchMany({
    endpoint: `/groups/${groupId}/shadow-assignments`
  });

export const create = groupId => actions.addResource({ groupId });
export const editShadowAssignment = actions.updateResource;
export const deleteShadowAssignment = actions.removeResource;

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
