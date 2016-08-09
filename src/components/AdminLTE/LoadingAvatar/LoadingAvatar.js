import React from 'react';
import styles from './LoadingAvatar.scss';

const LoadingAvatar = ({
  size = 45
}) => (
  <div
    className={styles.loadingAvatar}
    style={{
      width: size,
      height: size,
      lineHeight: size,
      borderRadius: Math.ceil(size / 2)
    }}>
    <Icon name='circle-o-notch' spin />
  </div>
);

export default LoadingAvatar;
