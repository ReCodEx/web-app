import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SuccessIcon } from '../../icons';

const LogginSuccessful = () =>
  <Button disabled bsStyle="success">
    <SuccessIcon gapRight />
    <FormattedMessage
      id="app.casLoginButton.success"
      defaultMessage="Logged in"
    />
  </Button>;

export default LogginSuccessful;
