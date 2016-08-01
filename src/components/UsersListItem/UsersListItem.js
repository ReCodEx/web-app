import React, { PropTypes } from 'react';
import { ListGroupItem, Clearfix } from 'react-bootstrap';
import Gravatar from 'react-gravatar';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import { USER_URI_FACTORY } from '../../links';

const UsersListItem = ({
  user: {
    id,
    fullName,
    email
  }
}) => (
  <tr>
    <td className='text-center' width={80}>
      <Gravatar
        email={email}
        https
        default='retro'
        className='img-circle'
        size={45} />
    </td>
    <td>
      <p><strong>{fullName}</strong></p>
      <small><Link to={USER_URI_FACTORY(id)}>{id}</Link></small>
    </td>
  </tr>
);

UsersListItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired
};

export default UsersListItem;
