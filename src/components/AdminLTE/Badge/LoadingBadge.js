import React from 'react';
import LoadingAvatar from '../LoadingAvatar';

const LoadingBadge = () => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <LoadingAvatar />
    </div>
    <div className='pull-left info'>
      <p>Načítám...</p>
    </div>
  </div>
);

export default LoadingBadge;
