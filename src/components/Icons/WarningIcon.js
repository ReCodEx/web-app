import React from 'react';
import Icon from 'react-fontawesome';

const WarningIcon = (props) =>
  <strong>
    <Icon {...props} name='exclamation-triangle' />
  </strong>;

export default WarningIcon;
