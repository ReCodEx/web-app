import React from 'react';
import Icon from 'react-fontawesome';

const SuccessIcon = props =>
  <strong className="text-success">
    <Icon {...props} name="check" />
  </strong>;

export default SuccessIcon;
