import React from 'react';
import { FailedAvatar } from '../Avatar';

const FailedBadge = (props) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <FailedAvatar {...props} />
    </div>
    <div className='pull-left info'>
      <p>Chyba načítání dat :-(</p>
    </div>
  </div>
);

export default FailedBadge;
