import React, { PropTypes } from 'react';
import Gravatar from 'react-gravatar';

const Badge = ({
  name,
  email
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
      <small>{email}</small>
    </div>
  </div>
);

Badge.propTypes = {
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  description: PropTypes.string,
};

export default Badge;
