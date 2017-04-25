import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../widgets/FlatButton';
import Icon from 'react-fontawesome';

const Login = ({ onClick }) => (
  <Button bsStyle="success" onClick={onClick}>
    <Icon name="university" />{' '}
    <FormattedMessage
      id="app.casLoginButton.login"
      defaultMessage="Authenticate through CAS"
    />
  </Button>
);

Login.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default Login;
