import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const UsersListItem = ({ id, fullName, avatarUrl, createActions }) =>
  <tr>
    <td>
      <UsersNameContainer userId={id} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(id)}
      </td>}
  </tr>;

UsersListItem.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  createActions: PropTypes.func
};

export default UsersListItem;
