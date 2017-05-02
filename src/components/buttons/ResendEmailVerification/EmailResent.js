import React from 'react';
import PropTypes from 'prop-types';
import { SuccessIcon } from '../../icons';
import FlatButton from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const EmailResent = ({ resend, ...props }) => {
  return (
    <FlatButton onClick={resend} bsStyle="success" {...props}>
      <SuccessIcon />
      {' '}
      <FormattedMessage
        id="app.resendEmailVerification.resent"
        defaultMessage="Email has been resent"
      />
    </FlatButton>
  );
};

EmailResent.propTypes = {
  resend: PropTypes.func.isRequired
};

export default EmailResent;
