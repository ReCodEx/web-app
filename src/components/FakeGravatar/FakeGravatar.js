import React from 'react';

const FakeGravatar = ({
  size = 45,
  color = 'white'
}) => (
  <div style={{
    width: size,
    height: size,
    background: color,
    borderRadius: Math.ceil(size/2)
  }} />
);

export default FakeGravatar;
