import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import UsersListItem from '../UsersListItem';

const UsersList = ({ heading = null, users = [], createActions, ...rest }) =>
  <Table hover={users.length > 0}>
    {heading &&
      users.length > 0 &&
      <thead>
        {heading}
      </thead>}

    <tbody>
      {users.map((user, i) =>
        <UsersListItem
          user={user}
          createActions={createActions}
          key={`user-${user ? user.id : i}`}
          {...rest}
        />
      )}

      {users.length === 0 &&
        <tr>
          <td className="text-center text-muted">
            <FormattedMessage
              id="app.userList.noUsers"
              defaultMessage="No users match selected filters."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

UsersList.propTypes = {
  heading: PropTypes.any,
  users: PropTypes.array,
  createActions: PropTypes.func
};

export default UsersList;
