import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const FailedIcon = props =>
  <strong className="text-danger">
    <FontAwesomeIcon {...props} icon="times" />
  </strong>;

export default FailedIcon;
