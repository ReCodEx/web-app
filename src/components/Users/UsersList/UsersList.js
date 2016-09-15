import React from 'react';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import LoadingUsersListItem from '../LoadingUsersListItem';
import UsersListItem from '../UsersListItem';

const UsersList = ({
  users = [],
  createActions,
  ...rest
}) => (
  <Table>
    <tbody>
    {users.map(user => (
      <UsersListItem {...user} createActions={createActions} key={user.id} />
    ))}

    {users.length === 0 && (
      <tr>
        <td className='text-center'>
          <FormattedMessage id='app.userList.noUsers' defaultMessage='There are no users in this list.' />
        </td>
      </tr>
    )}
    </tbody>
  </Table>
);

export default UsersList;
