import React from 'react';
import { Failure } from '../../icons';
import FakeAvatar from './FakeAvatar';

const FailedAvatar = props =>
  <FakeAvatar {...props}>
    <Failure />
  </FakeAvatar>;

export default FailedAvatar;
