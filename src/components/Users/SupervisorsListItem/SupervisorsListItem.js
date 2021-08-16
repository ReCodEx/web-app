import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { AdminIcon, SupervisorIcon, UserIcon, LoadingIcon } from '../../icons';

const SupervisorsListItem = ({
  showButtons,
  id,
  groupId,
  type = null,
  addAdmin = null,
  addSupervisor = null,
  removeMember = null,
  pendingMembership = false,
}) => {
  return (
    <tr>
      <td className="shrink-col text-center">
        {pendingMembership ? (
          <LoadingIcon />
        ) : type === 'admin' ? (
          <OverlayTrigger
            placement="right"
            overlay={
              <Popover id={`icon-${id}`}>
                {
                  <Popover.Title>
                    <FormattedMessage id="app.membersList.adminPopover.title" defaultMessage="Administrator" />
                  </Popover.Title>
                }
                <Popover.Content className="small text-muted">
                  <FormattedMessage
                    id="app.membersList.adminPopover.description"
                    defaultMessage="An administrator can do almost anything with the group and all its assets including managing other members. Administrators are also displayed in group listings. Administrator privileges are passed down to all sub-groups transitively."
                  />
                </Popover.Content>
              </Popover>
            }>
            <AdminIcon />
          </OverlayTrigger>
        ) : type === 'supervisor' ? (
          <OverlayTrigger
            placement="right"
            overlay={
              <Popover id={`icon-${id}`}>
                {
                  <Popover.Title>
                    <FormattedMessage id="app.membersList.supervisorPopover.title" defaultMessage="Supervisor" />
                  </Popover.Title>
                }
                <Popover.Content className="small text-muted">
                  <FormattedMessage
                    id="app.membersList.supervisorPopover.description"
                    defaultMessage="A supervisor is slightly less potent than administrator. The privileges encompass everything related to students and assignments; however, suppervisor cannot manage other members."
                  />
                </Popover.Content>
              </Popover>
            }>
            <SupervisorIcon />
          </OverlayTrigger>
        ) : (
          <UserIcon />
        )}
      </td>
      <td className="shrink-col text-nowrap">
        <UsersNameContainer userId={id} />
      </td>

      {showButtons && (
        <td className="text-right">
          <TheButtonGroup>
            {addAdmin && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`adminButtonTooltip-${id}`}>
                    <FormattedMessage id="app.membersList.changeToAdmin" defaultMessage="Change to administrator" />
                  </Tooltip>
                }>
                <Button size="xs" onClick={() => addAdmin(groupId, id)} variant="warning" disabled={pendingMembership}>
                  <AdminIcon smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}

            {addSupervisor && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`supervisorButtonTooltip-${id}`}>
                    <FormattedMessage id="app.membersList.changeToSupervisor" defaultMessage="Change to supervisor" />
                  </Tooltip>
                }>
                <Button
                  size="xs"
                  onClick={() => addSupervisor(groupId, id)}
                  variant="warning"
                  disabled={pendingMembership}>
                  <SupervisorIcon smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}

            {removeMember && (
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`removeButtonTooltip-${id}`}>
                    <FormattedMessage id="app.membersList.removeMember" defaultMessage="Remove from group" />
                  </Tooltip>
                }>
                <Button
                  size="xs"
                  onClick={() => removeMember(groupId, id)}
                  variant="danger"
                  disabled={pendingMembership}>
                  <Icon icon="user-slash" smallGapRight smallGapLeft fixedWidth />
                </Button>
              </OverlayTrigger>
            )}
          </TheButtonGroup>
        </td>
      )}
    </tr>
  );
};

SupervisorsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  showButtons: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  type: PropTypes.string,
  addAdmin: PropTypes.func,
  addSupervisor: PropTypes.func,
  removeMember: PropTypes.func,
  pendingMembership: PropTypes.bool,
};

export default SupervisorsListItem;
