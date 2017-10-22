import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import UsersListItem from '../UsersListItem';

const UsersList = ({ users = [], createActions, intl, ...rest }) =>
  <Table hover>
    <tbody>
      {users
        .sort((a, b) => {
          const aName = a.name.lastName + ' ' + a.name.firstName;
          const bName = b.name.lastName + ' ' + b.name.firstName;
          return aName.localeCompare(bName, intl.locale);
        })
        .map(user =>
          <UsersListItem
            id={user.id}
            createActions={createActions}
            key={user.id}
          />
        )}

      {users.length === 0 &&
        <tr>
          <td className="text-center">
            <FormattedMessage
              id="app.userList.noUsers"
              defaultMessage="There are no users in this list."
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
