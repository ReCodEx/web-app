import React from 'react';
import PropTypes from 'prop-types';
import UsersName from '../../../components/Users/UsersName';

const UsersListItem = ({
  user,
  createActions,
  loggedUserId = '',
  useGravatar = false
}) =>
  <tr>
    <td>
      <UsersName
        {...user}
        useGravatar={useGravatar}
        currentUserId={loggedUserId}
        showEmail="full"
      />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(user.id)}
      </td>}
  </tr>;

UsersListItem.propTypes = {
  user: PropTypes.object.isRequired,
  createActions: PropTypes.func,
  loggedUserId: PropTypes.string,
  useGravatar: PropTypes.bool
};

export default UsersListItem;
