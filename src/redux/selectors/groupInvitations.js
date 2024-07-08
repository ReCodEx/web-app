import { createSelector } from 'reselect';
import { isReady, getJsData } from '../helpers/resourceManager';
import { fetchGroupInvitationsEndpoint } from '../modules/groupInvitations.js';

const getParam = (state, id) => id;

const getGroupInvitations = state => state.groupInvitations;
const groupsInvitationsSelector = state => getGroupInvitations(state).get('resources');
const groupsInvitationsAcceptingSelector = state => getGroupInvitations(state).get('accepting');

export const invitationSelector = createSelector([groupsInvitationsSelector, getParam], (invitations, id) =>
  invitations.get(id)
);

export const groupInvitationsSelector = createSelector([groupsInvitationsSelector, getParam], (invitations, groupId) =>
  invitations
    .toArray()
    .map(([_, val]) => val) // invitations are stored in map, get the values
    .filter(isReady)
    .map(getJsData)
    .filter(invitation => invitation.groupId === groupId)
    .sort((a, b) => b.createdAt - a.createdAt)
);

export const fetchManyGroupInvitationsStatus = createSelector([getGroupInvitations, getParam], (state, groupId) =>
  state.getIn(['fetchManyStatus', fetchGroupInvitationsEndpoint(groupId)])
);

export const groupInvitationsAccessorJS = createSelector(groupsInvitationsSelector, invitations => id => {
  const invitation = invitations.get(id);
  return invitation && isReady(invitation) ? getJsData(invitation) : null;
});

export const getInvitationAcceptingStatus = createSelector(
  [groupsInvitationsAcceptingSelector, getParam],
  (accepting, id) => (accepting ? accepting.get(id, null) : null)
);
