import React from 'react';
import { FailureIcon } from '../../icons';
import FakeAvatar from './FakeAvatar.js';

const FailedAvatar = props => (
  <FakeAvatar {...props}>
    <FailureIcon />
  </FakeAvatar>
);

export default FailedAvatar;
