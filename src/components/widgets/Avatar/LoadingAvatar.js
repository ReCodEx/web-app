import React from 'react';
import { LoadingIcon } from '../../icons';
import FakeAvatar from './FakeAvatar';

const LoadingAvatar = props => (
  <FakeAvatar {...props}>
    <LoadingIcon />
  </FakeAvatar>
);

export default LoadingAvatar;
