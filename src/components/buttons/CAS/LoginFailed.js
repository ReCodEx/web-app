import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { WarningIcon } from '../../icons';

const LoginFailed = ({ onClick }) =>
  <Button bsStyle="danger" onClick={onClick}>
    <WarningIcon gapRight />
    <FormattedMessage
      id="app.casLoginButton.failed"
      defaultMessage="Try again"
    />
  </Button>;

LoginFailed.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default LoginFailed;
