import React from 'react';
import { FailedIcon } from '../../icons';
import FakeAvatar from './FakeAvatar';

const FailedAvatar = props =>
  <FakeAvatar {...props}>
    <FailedIcon />
  </FakeAvatar>;

export default FailedAvatar;
