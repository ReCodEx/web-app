import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { LoadingIcon } from '../../icons';

const LoggingIn = () =>
  <Button disabled>
    <LoadingIcon gapRight />
    <FormattedMessage
      id="app.casLoginButton.loggingIn"
      defaultMessage="Logging in ..."
    />
  </Button>;

export default LoggingIn;
