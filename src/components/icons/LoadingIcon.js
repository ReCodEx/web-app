import React from 'react';
import Icon from 'react-fontawesome';

const LoadingIcon = props =>
  <Icon {...props} name="spinner" pulse style={{ opacity: 0.8 }} />;

export default LoadingIcon;
