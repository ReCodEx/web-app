import React from 'react';
import FakeGravatar from '../FakeGravatar';

const LoadingBadge = () => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <FakeGravatar />
    </div>
    <div className='pull-left info'>
      <p>Načítám...</p>
    </div>
  </div>
);

export default LoadingBadge;
