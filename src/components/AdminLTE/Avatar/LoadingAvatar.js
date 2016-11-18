import React from 'react';
import { LoadingIcon } from '../../Icons';

const LoadingAvatar = ({
  size = 45,
  borderWidth = 2,
  light = false
}) => (
  <div style={{
    display: 'inline-block',
    background: !light ? 'black' : 'white',
    color: 'gray',
    textAlign: 'center',
    width: size,
    height: size,
    borderStyle: 'solid',
    borderWidth,
    borderColor: !light ? 'transparent' : 'gray',
    lineHeight: `${size}px`,
    borderRadius: Math.ceil(size / 2)
  }}>
    <LoadingIcon />
  </div>
);

LoadingAvatar.propTypes = {
  size: PropTypes.number,
  borderWidth: PropTypes.number,
  light: PropTypes.bool
};

export default LoadingAvatar;
