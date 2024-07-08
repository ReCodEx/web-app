import { handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware.js';
import factory, {
  createRecord,
  initialState,
  createActionsWithPostfixes,
  resourceStatus,
} from '../helpers/resourceManager';

const resourceName = 'groupInvitations';
const { actions, actionTypes, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/group-invitations/${id}`,
});

/**
 * Actions
 */

export { actionTypes };

export const additionalActionTypes = {
  ...createActionsWithPostfixes('ACCEPT_INVITATION', 'recodex/groupInvitations'),
};

export const fetchGroupInvitation = actions.fetchResource;
export const fetchGroupInvitationIfNeeded = actions.fetchOneIfNeeded;
export const createGroupInvitation = (groupId, expireAt, note) =>
  actions.addResource({ expireAt, note }, `${groupId}-${Math.random().toString()}`, `/groups/${groupId}/invitations`);
export const editGroupInvitation = actions.updateResource;
export const deleteGroupInvitation = actions.removeResource;

export const fetchGroupInvitationsEndpoint = groupId => `/groups/${groupId}/invitations`;

export const fetchGroupInvitations = groupId =>
  actions.fetchMany({
    endpoint: fetchGroupInvitationsEndpoint(groupId),
  });

export const acceptGroupInvitation = id =>
  createApiAction({
    type: additionalActionTypes.ACCEPT_INVITATION,
    method: 'POST',
    endpoint: `/group-invitations/${id}/accept`,
    meta: { id },
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { payload: { invitation } }) =>
      state.setIn(['resources', invitation.id], createRecord({ state: resourceStatus.FULFILLED, data: invitation })),

    [additionalActionTypes.ACCEPT_INVITATION_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['accepting', id], resourceStatus.PENDING),

    [additionalActionTypes.ACCEPT_INVITATION_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['accepting', id], resourceStatus.FAILED),

    [additionalActionTypes.ACCEPT_INVITATION_FULFILLED]: (state, { meta: { id } }) =>
      state.setIn(['accepting', id], resourceStatus.FULFILLED),
  }),
  initialState
);

export default reducer;
