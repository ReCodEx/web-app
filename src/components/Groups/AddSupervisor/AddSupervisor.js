import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import AddUserContainer from '../../../containers/AddUserContainer';
import { knownRoles, isSupervisorRole } from '../../helpers/usersRoles';
import { AdminRoleIcon, ObserverIcon, SupervisorIcon, LoadingIcon } from '../../icons';

const ROLES_FILTER = knownRoles.filter(isSupervisorRole);

const buildMembersIndex = defaultMemoize(
  (primaryAdmins, supervisors, observers, studentsIds) =>
    new Set([
      ...primaryAdmins.map(u => u.id),
      ...supervisors.map(u => u.id),
      ...observers.map(u => u.id),
      ...studentsIds,
    ])
);

const AddSupervisor = ({
  groupId,
  instanceId,
  primaryAdmins,
  supervisors,
  observers,
  studentsIds,
  addAdmin = null,
  addSupervisor = null,
  addObserver = null,
  pendingMemberships,
}) => {
  const membersIndex = buildMembersIndex(primaryAdmins, supervisors, observers, studentsIds);
  return (
    <AddUserContainer
      instanceId={instanceId}
      id={`add-supervisor-${groupId}`}
      rolesFilter={ROLES_FILTER}
      createActions={({ id }) => {
        const isMember = membersIndex.has(id);
        const isPending = pendingMemberships.includes(id);
        return isPending ? (
          <LoadingIcon />
        ) : (
          <TheButtonGroup>
            {addAdmin && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`adminButtonTooltip-${id}`}>
                    {isMember ? (
                      <FormattedMessage
                        id="app.membersList.alreadyMember"
                        defaultMessage="Selected user is already a member of the group"
                      />
                    ) : (
                      <FormattedMessage id="app.membersList.addAsAdmin" defaultMessage="Add as administrator" />
                    )}
                  </Tooltip>
                }>
                <Button
                  size="xs"
                  onClick={() => addAdmin(groupId, id)}
                  disabled={isMember}
                  variant={isMember ? 'secondary' : 'success'}>
                  <AdminRoleIcon smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}

            {addSupervisor && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`supervisorButtonTooltip-${id}`}>
                    {isMember ? (
                      <FormattedMessage
                        id="app.membersList.alreadyMember"
                        defaultMessage="Selected user is already a member of the group"
                      />
                    ) : (
                      <FormattedMessage id="app.membersList.addAsSupervisor" defaultMessage="Add as supervisor" />
                    )}
                  </Tooltip>
                }>
                <Button
                  size="xs"
                  onClick={() => addSupervisor(groupId, id)}
                  disabled={isMember}
                  variant={isMember ? 'secondary' : 'success'}>
                  <SupervisorIcon smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}

            {addObserver && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`observerButtonTooltip-${id}`}>
                    {isMember ? (
                      <FormattedMessage
                        id="app.membersList.alreadyMember"
                        defaultMessage="Selected user is already a member of the group"
                      />
                    ) : (
                      <FormattedMessage id="app.membersList.addAsObserver" defaultMessage="Add as observer" />
                    )}
                  </Tooltip>
                }>
                <Button
                  size="xs"
                  onClick={() => addObserver(groupId, id)}
                  disabled={isMember}
                  variant={isMember ? 'secondary' : 'success'}>
                  <ObserverIcon smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}
          </TheButtonGroup>
        );
      }}
    />
  );
};

AddSupervisor.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  primaryAdmins: PropTypes.array.isRequired,
  supervisors: PropTypes.array.isRequired,
  observers: PropTypes.array.isRequired,
  studentsIds: PropTypes.array.isRequired,
  addAdmin: PropTypes.func,
  addSupervisor: PropTypes.func,
  addObserver: PropTypes.func,
  pendingMemberships: ImmutablePropTypes.list,
};

export default AddSupervisor;
