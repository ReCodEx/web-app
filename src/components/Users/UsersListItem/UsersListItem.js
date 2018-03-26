import React from 'react';
import PropTypes from 'prop-types';
import UsersName from '../../../components/Users/UsersName';

const UsersListItem = ({ user, createActions, loggedUserId = '' }) =>
  <tr>
    <td>
      <UsersName {...user} currentUserId={loggedUserId} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(user.id)}
      </td>}
  </tr>;

UsersListItem.propTypes = {
  user: PropTypes.object.isRequired,
  createActions: PropTypes.func,
  loggedUserId: PropTypes.string
};

export default UsersListItem;
