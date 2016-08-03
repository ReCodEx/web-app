import React from 'react';
import Icon from 'react-fontawesome';

const FailedIcon = (props) =>
  <strong className='text-warning'>
    <Icon {...props} name='exclamation-triangle' />
  </strong>;

export default FailedIcon;
