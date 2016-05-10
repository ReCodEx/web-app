import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import Box from '../../components/Box/Box';
import LoginForm from '../../components/LoginForm/LoginForm';

import { statusTypes, login } from '../../redux/modules/auth';

class Login extends Component {

  render() {
    const { login, isLoggingIn, hasFailed } = this.props;

    return (
      <Row>
        <Helmet title='Přihlášení' />
        <Col sm={6} smOffset={3}>
          <LoginForm
            tryLogin={login}
            isLoggingIn={isLoggingIn}
            hasFailed={hasFailed} />
        </Col>
      </Row>
    );
  }

}

Login.propTypes = {
  login: PropTypes.func.isRequired,

};

export default connect((state) => ({
  isLoggingIn: state.auth.status === statusTypes.LOGGING_IN,
  hasFailed: state.auth.status === statusTypes.LOGIN_FAILED,
}), {
  login
})(Login);
