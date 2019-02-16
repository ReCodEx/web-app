import React from 'react';
import PropTypes from 'prop-types';
import { RefreshIcon } from '../../icons';
import FlatButton from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const ResendEmail = ({ resend, ...props }) => {
  return (
    <FlatButton onClick={resend} {...props}>
      <RefreshIcon gapRight />
      <FormattedMessage id="app.resendEmailVerification.resend" defaultMessage="Resend verification email" />
    </FlatButton>
  );
};

ResendEmail.propTypes = {
  resend: PropTypes.func.isRequired,
};

export default ResendEmail;
