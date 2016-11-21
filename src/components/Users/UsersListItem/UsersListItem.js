import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const UsersListItem = ({
  id,
  fullName,
  avatarUrl,
  createActions
}, {
  links: { USER_URI_FACTORY }
}) => (
  <tr>
    <td className='text-center' width={80}>
      <img src={avatarUrl} className='img-circle' width={45} />
    </td>
    <td>
      <p><strong>{fullName}</strong></p>
      <small><Link to={USER_URI_FACTORY(id)}>{id}</Link></small>
    </td>
    {createActions && (
      <td className='text-right'>
        {createActions(id)}
      </td>
    )}
  </tr>
);

UsersListItem.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  createActions: PropTypes.func
};

UsersListItem.contextTypes = {
  links: PropTypes.object
};

export default UsersListItem;
