import React, { PropTypes } from 'react';
import FailedIcon from './FailedIcon';
import SuccessIcon from './SuccessIcon';

const MaybeSucceededIcon = ({ success = false, ...props }) =>
  success
    ? <SuccessIcon {...props} />
    : <FailedIcon {...props} />;

MaybeSucceededIcon.propTypes = {
  success: PropTypes.bool
};

export default MaybeSucceededIcon;
