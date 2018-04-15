import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const SuccessIcon = props =>
  <strong className="text-success">
    <FontAwesomeIcon {...props} icon="check" />
  </strong>;

export default SuccessIcon;
