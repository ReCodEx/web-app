import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../AdminLTE/FlatButton';
import { SuccessIcon } from '../Icons';

const LogginSuccessful = () => (
  <Button disabled bsStyle="success">
    <SuccessIcon />{' '}
    <FormattedMessage
      id="app.casLoginButton.success"
      defaultMessage="Logged in"
    />
  </Button>
);

export default LogginSuccessful;
