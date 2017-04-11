import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../AdminLTE/FlatButton';
import { WarningIcon } from '../Icons';

const LoginFailed = ({ onClick }) => (
  <Button bsStyle="danger" onClick={onClick}>
    <WarningIcon />{' '}
    <FormattedMessage
      id="app.casLoginButton.failed"
      defaultMessage="Try again"
    />
  </Button>
);

LoginFailed.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default LoginFailed;
