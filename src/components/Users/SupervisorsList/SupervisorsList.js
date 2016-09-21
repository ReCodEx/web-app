import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import SupervisorsListItem, { LoadingSupervisorsListItem } from '../SupervisorsListItem';

const SupervisorsList = ({
  groupId,
  users,
  isLoaded = true,
  isAdmin
}) => (
  <Table>
    <tbody>
    {users.map(user => (
      <SupervisorsListItem
        key={user.id}
        {...user}
        groupId={groupId}
        isAdmin={isAdmin} />
    ))}

    {users.length === 0 && isLoaded && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.userList.noSupervisors' defaultMessage='There are no supervisors in this list.' />
        </td>
      </tr>
    )}

    {!isLoaded && (
      <LoadingSupervisorsListItem />
    )}
    </tbody>
  </Table>
);

SupervisorsList.propTypes = {
  users: PropTypes.array.isRequired
};

export default SupervisorsList;
