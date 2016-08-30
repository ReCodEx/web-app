import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import UsersListItem from '../UsersListItem';

const SupervisorsList = ({
  users,
  isAdmin
}) => (
  <Table>
    <tbody>
    {users.map((user, i) => (
      <UsersListItem {...user} isAdmin={isAdmin} key={i} />
    ))}

    {users.length === 0 && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.userList.noSupervisors' defaultMessage='There are no supervisors in this list.' />
        </td>
      </tr>
    )}
    </tbody>
  </Table>
);

SupervisorsList.propTypes = {
  users: PropTypes.array.isRequired
};

export default SupervisorsList;
