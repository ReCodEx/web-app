import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../AdminLTE/FlatButton';
import { LoadingIcon } from '../Icons';

const LoggingIn = () => (
  <Button disabled>
    <LoadingIcon />{' '}
    <FormattedMessage
      id="app.casLoginButton.loggingIn"
      defaultMessage="Logging in ..."
    />
  </Button>
);

export default LoggingIn;
