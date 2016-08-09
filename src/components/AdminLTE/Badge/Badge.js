import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import { USER_URI_FACTORY } from '../../../links';

const Badge = ({
  user: { id, fullName, avatarUrl },
  logout
}) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <img src={avatarUrl} alt={fullName} className='img-circle' />
    </div>
    <div className='pull-left info'>
      <p>
        <Link to={USER_URI_FACTORY(id)}>
          {fullName}
        </Link>
      </p>
      <a href='#' onClick={logout}>
        <Icon name='power-off' className='text-danger' /> <FormattedMessage id='app.logout' defaultMessage='Logout' />
      </a>
    </div>
  </div>
);

Badge.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func
};

export default Badge;
