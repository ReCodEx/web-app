import React, { PropTypes } from 'react';
import Gravatar from 'react-gravatar';
import Icon from 'react-fontawesome';

const Badge = ({
  user: { fullName, email },
  logout
}) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <Gravatar
        email={email}
        https
        default='retro'
        className='img-circle'
        size={45} />
    </div>
    <div className='pull-left info'>
      <p>{fullName}</p>
      <a href='#' onClick={logout}><Icon name='power-off' className='text-danger' /> Odhlásit se</a>
    </div>
  </div>
);

Badge.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func
};

export default Badge;
