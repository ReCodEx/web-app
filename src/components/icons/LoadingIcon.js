import React from 'react';
import Icon from 'react-fontawesome';

const LoadingIcon = props => (
  <Icon {...props} name="rotate-right" spin style={{ opacity: 0.5 }} />
);

export default LoadingIcon;
