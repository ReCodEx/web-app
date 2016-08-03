import React from 'react';
import FakeGravatar from '../FakeGravatar';

const FailedBadge = (props) => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <FakeGravatar {...props} />
    </div>
    <div className='pull-left info'>
      <p>Chyba načítání dat :-(</p>
    </div>
  </div>
);

export default FailedBadge;
