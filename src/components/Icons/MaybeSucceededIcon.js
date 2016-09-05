import React from 'react';
import FailedIcon from './FailedIcon';
import SuccessIcon from './SuccessIcon';

const MaybeSucceededIcon = ({ success = false, ...props }) =>
  success
    ? <SuccessIcon {...props} />
    : <FailedIcon {...props} />;

export default MaybeSucceededIcon;
