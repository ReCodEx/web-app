import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/Box';
import LoginForm from '../../components/LoginForm';

import { statusTypes, login } from '../../redux/modules/auth';
import { DASHBOARD_URI } from '../../links';

class Login extends Component {

  constructor(props, context) {
    super(props, context);
    this.checkIfIsLoggedIn(props);
  }

  componentWillReceiveProps = props => this.checkIfIsLoggedIn(props);

  checkIfIsLoggedIn = props => {
    const { hasSucceeded, goToDashboard } = props;
    if (hasSucceeded) {
      setTimeout(() => this.context.router.push(DASHBOARD_URI), 600);
    }
  };

  render() {
    const { login, isLoggingIn, hasFailed, hasSucceeded } = this.props;

    return (
      <PageContent title='Přihlášení'>
        <Row>
          <Col sm={6} smOffset={3}>
            <LoginForm
              tryLogin={login}
              isTryingToLogin={isLoggingIn}
              hasFailed={hasFailed}
              hasSucceeded={hasSucceeded} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

Login.contextTypes = {
  router: PropTypes.object
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isLoggingIn: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired,
};

export default connect(
  state => ({
    isLoggingIn: state.auth.status === statusTypes.LOGGING_IN,
    hasFailed: state.auth.status === statusTypes.LOGIN_FAILIURE,
    hasSucceeded: state.auth.status === statusTypes.LOGGED_IN
  }),
  {
    login
  }
)(Login);
