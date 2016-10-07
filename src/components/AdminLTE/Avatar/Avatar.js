import React, { PropTypes } from 'react';

const Avatar = ({
  src,
  size = 45,
  title = 'avatar'
}) => (
  <img src={src} alt={title} width={size} className='img-circle' />
);

Avatar.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  size: PropTypes.number
};

export default Avatar;
