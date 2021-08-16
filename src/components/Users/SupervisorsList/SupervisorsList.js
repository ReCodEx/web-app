import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import SupervisorsListItem from '../SupervisorsListItem';
import { LoadingIcon } from '../../icons';

const SupervisorsList = ({
  groupId,
  primaryAdmins,
  supervisors,
  observers,
  isLoaded = true,
  showButtons = false,
  addAdmin = null,
  addSupervisor = null,
  addObserver = null,
  removeMember = null,
  pendingMemberships,
}) =>
  isLoaded ? (
    <Table hover responsive className="mb-1">
      <tbody>
        {primaryAdmins.map(user => (
          <SupervisorsListItem
            key={user.id}
            {...user}
            groupId={groupId}
            showButtons={showButtons}
            type="admin"
            addSupervisor={addSupervisor}
            addObserver={addObserver}
            removeMember={removeMember}
            pendingMembership={pendingMemberships.includes(user.id)}
          />
        ))}

        {supervisors.map(user => (
          <SupervisorsListItem
            key={user.id}
            {...user}
            groupId={groupId}
            showButtons={showButtons}
            type="supervisor"
            addAdmin={addAdmin}
            addObserver={addObserver}
            removeMember={removeMember}
            pendingMembership={pendingMemberships.includes(user.id)}
          />
        ))}

        {observers.map(user => (
          <SupervisorsListItem
            key={user.id}
            {...user}
            groupId={groupId}
            showButtons={showButtons}
            type="observer"
            addAdmin={addAdmin}
            addSupervisor={addSupervisor}
            removeMember={removeMember}
            pendingMembership={pendingMemberships.includes(user.id)}
          />
        ))}

        {primaryAdmins.length === 0 && supervisors.length === 0 && observers.length === 0 && (
          <tr>
            <td className="text-center text-muted">
              <FormattedMessage
                id="app.membersList.noMembers"
                defaultMessage="The group has no supervisors or admins."
              />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  ) : (
    <div className="p-3 text-center">
      <LoadingIcon gapRight />
      <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
    </div>
  );

SupervisorsList.propTypes = {
  primaryAdmins: PropTypes.array.isRequired,
  supervisors: PropTypes.array.isRequired,
  observers: PropTypes.array.isRequired,
  groupId: PropTypes.string.isRequired,
  isLoaded: PropTypes.bool,
  showButtons: PropTypes.bool,
  addAdmin: PropTypes.func,
  addSupervisor: PropTypes.func,
  addObserver: PropTypes.func,
  removeMember: PropTypes.func,
  pendingMemberships: ImmutablePropTypes.list,
};

export default SupervisorsList;
