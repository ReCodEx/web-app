import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';

import { Row, Col } from 'react-bootstrap';
import Box from '../../components/Box/Box';
import LoginForm from '../../components/LoginForm/LoginForm';

class Login extends Component {

  render() {
    return (
      <Row>
        <Helmet title='Přihlášení' />
        <Col sm={6} smOffset={3}>
          <LoginForm tryLogin={(login, pwd) => console.log(login, pwd)} />
        </Col>
      </Row>
    );
  }

}

export default Login;
