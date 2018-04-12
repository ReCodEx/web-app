import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const LoadingIcon = props =>
  <FontAwesomeIcon {...props} icon="spinner" pulse style={{ opacity: 0.8 }} />;

export default LoadingIcon;
