import React from 'react';
import { FailedIcon } from '../../Icons';
import FakeAvatar from './FakeAvatar';

const FailedAvatar = (props) => (
  <FakeAvatar {...props}>
    <FailedIcon />
  </FakeAvatar>
);

export default FailedAvatar;
