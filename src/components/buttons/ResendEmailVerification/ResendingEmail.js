import React from 'react';
import { LoadingIcon } from '../../icons';
import FlatButton from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const EmailResent = props => {
  return (
    <FlatButton disabled {...props}>
      <LoadingIcon gapRight />
      <FormattedMessage
        id="app.resendEmailVerification.resending"
        defaultMessage="Sending email ..."
      />
    </FlatButton>
  );
};

export default EmailResent;
