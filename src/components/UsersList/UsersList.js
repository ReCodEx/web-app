import React from 'react';
import { Table } from 'react-bootstrap';

import LoadingUsersListItem from '../LoadingUsersListItem';
import UsersListItem from '../UsersListItem';

const UsersList = ({
  users = [],
  ...rest
}) => (
  <Table>
    <tbody>
    {users.map((user, i) => (
      <UsersListItem user={user} key={i} />
    ))}

    {users.length === 0 && (
      <tr>
        <td className='text-center'>Žádné záznamy nejsou k dispozici.</td>
      </tr>
    )}

    </tbody>
  </Table>
);

export default UsersList;
