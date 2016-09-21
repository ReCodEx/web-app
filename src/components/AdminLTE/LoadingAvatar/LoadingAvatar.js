import React from 'react';
import { LoadingIcon } from '../../Icons';

const LoadingAvatar = ({
  size = 45
}) => (
  <div style={{
    display: 'inline-block',
    background: 'black',
    color: 'gray',
    textAlign: 'center',
    width: size,
    height: size,
    lineHeight: `${size}px`,
    borderRadius: Math.ceil(size / 2)
  }}>
    <LoadingIcon />
  </div>
);

export default LoadingAvatar;
