import React from 'react';
import LoadingAvatar from '../LoadingAvatar';

const FailedBadge = (props) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <LoadingAvatar {...props} />
    </div>
    <div className='pull-left info'>
      <p>Chyba načítání dat :-(</p>
    </div>
  </div>
);

export default FailedBadge;
