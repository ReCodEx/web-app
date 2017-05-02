import React from 'react';
import PropTypes from 'prop-types';
import { FailedIcon } from '../../icons';
import FlatButton from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const ResendingFailed = ({ resend, ...props }) => {
  return (
    <FlatButton onClick={resend} bsStyle="danger" {...props}>
      <FailedIcon />
      {' '}
      <FormattedMessage
        id="app.resendEmailVerification.failed"
        defaultMessage="Resending failed"
      />
    </FlatButton>
  );
};

ResendingFailed.propTypes = {
  resend: PropTypes.func.isRequired
};

export default ResendingFailed;
