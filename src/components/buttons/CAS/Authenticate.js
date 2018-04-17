import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const Login = ({ onClick }) =>
  <Button bsStyle="success" onClick={onClick}>
    <Icon icon="university" gapRight />
    <FormattedMessage
      id="app.casLoginButton.login"
      defaultMessage="Authenticate through CAS"
    />
  </Button>;

Login.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default Login;
