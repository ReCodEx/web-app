import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import SupervisorsListItem, {
  LoadingSupervisorsListItem
} from '../SupervisorsListItem';

const SupervisorsList = ({
  groupId,
  users,
  isLoaded = true,
  isAdmin,
  primaryAdminsIds
}) =>
  <Table hover>
    <tbody>
      {isLoaded &&
        users.map(user =>
          <SupervisorsListItem
            key={user.id}
            {...user}
            groupId={groupId}
            isAdmin={isAdmin}
            primaryAdminsIds={primaryAdminsIds}
          />
        )}

      {users.length === 0 &&
        isLoaded &&
        <tr>
          <td className="text-center">
            <FormattedMessage
              id="app.userList.noSupervisors"
              defaultMessage="There are no supervisors on the list."
            />
          </td>
        </tr>}

      {!isLoaded && <LoadingSupervisorsListItem isAdmin={isAdmin} />}
    </tbody>
  </Table>;

SupervisorsList.propTypes = {
  users: PropTypes.array.isRequired,
  groupId: PropTypes.string.isRequired,
  isLoaded: PropTypes.bool,
  isAdmin: PropTypes.bool,
  primaryAdminsIds: PropTypes.array.isRequired
};

export default SupervisorsList;
