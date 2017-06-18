import React from 'react';
import PropTypes from 'prop-types';
import LoginSuccessful from './LoginSuccessful';
import LoggingIn from './LoggingIn';
import AuthenticationButtonContainer
  from '../../../containers/CAS/AuthenticationButtonContainer';

import { statusTypes } from '../../../redux/modules/auth';

const LoginButton = ({ loginStatus, onLogin, onFailed }) => {
  switch (loginStatus) {
    case statusTypes.LOGGING_IN:
      return <LoggingIn />;
    case statusTypes.LOGGED_IN:
      return <LoginSuccessful />;
    default:
      return (
        <AuthenticationButtonContainer
          retry={loginStatus === statusTypes.LOGIN_FAILED}
          onTicketObtained={onLogin}
          onFailed={onFailed}
        />
      );
  }
};

LoginButton.propTypes = {
  loginStatus: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
  onFailed: PropTypes.func.isRequired
};

export default LoginButton;
