import React, { PropTypes } from 'react';
import Gravatar from 'react-gravatar';
import Icon from 'react-fontawesome';

const Badge = ({
  name,
  email,
  logout
}) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <Gravatar
        email={email.trim().toLowerCase()}
        https
        default='retro'
        className='img-circle'
        size={45} />
    </div>
    <div className='pull-left info'>
      <p>{name}</p>
      <a href='#' onClick={logout}><Icon name='power-off' className='text-danger' /> Odhlásit se</a>
    </div>
  </div>
);

Badge.propTypes = {
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  description: PropTypes.string,
};

export default Badge;
