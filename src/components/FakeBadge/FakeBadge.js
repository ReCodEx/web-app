import React from 'react';

const fakeImgStyle = {
  width: 45,
  height: 45,
  background: 'white',
  borderRadius: 25
};

const FakeBadge = () => (
  <div className='user-panel'>
    <div className='pull-left image'>
      <div style={fakeImgStyle} />
    </div>
    <div className='pull-left info'>
      <p>Načítám...</p>
    </div>
  </div>
);

export default FakeBadge;
