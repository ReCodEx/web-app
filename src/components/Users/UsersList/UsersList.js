import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import UsersListItem from '../UsersListItem';

const UsersList = ({ users = [], createActions, intl, ...rest }) =>
  <Table hover>
    <tbody>
      {users.map((user, i) =>
        <UsersListItem
          user={user}
          createActions={createActions}
          key={i}
          {...rest}
        />
      )}

      {users.length === 0 &&
        <tr>
          <td className="text-center">
            <FormattedMessage
              id="app.userList.noUsers"
              defaultMessage="There are no users on the list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

UsersList.propTypes = {
  users: PropTypes.array,
  createActions: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(UsersList);
