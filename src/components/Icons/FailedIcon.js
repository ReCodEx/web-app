import React from 'react';
import Icon from 'react-fontawesome';

const FailedIcon = (props) =>
  <strong className='text-danger'>
    <Icon {...props} name='times' />
  </strong>;

export default FailedIcon;
