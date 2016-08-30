import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import LoginForm from '../../components/Public/LoginForm';

import { login } from '../../redux/modules/auth';
import { isLoggingIn, hasFailed, hasSucceeded } from '../../redux/selectors/auth';

class Login extends Component {

  constructor(props, context) {
    super(props, context);
    this.checkIfIsLoggedIn(props);
  }

  componentWillReceiveProps = props => this.checkIfIsLoggedIn(props);

  checkIfIsLoggedIn = props => {
    const { hasSucceeded, goToDashboard } = props;
    if (hasSucceeded) {
      setTimeout(() => this.context.router.push(this.context.links.DASHBOARD_URI), 600);
    }
  };

  render() {
    const { login, isLoggingIn, hasFailed, hasSucceeded } = this.props;
    const { links: { HOME_URI } } = this.context;

    return (
      <PageContent
        title={<FormattedMessage id='app.login.title' defaultMessage='Sign in' />}
        description={<FormattedMessage id='app.login.description' defaultMessage='Please fill your credentials' />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.homepage.title' />, link: HOME_URI },
          { text: <FormattedMessage id='app.login.title' /> }
        ]}>
        <Row>
          <Col md={6} mdOffset={3} sm={8} smOffset={2}>
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
  router: PropTypes.object,
  links: PropTypes.object
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isLoggingIn: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    isLoggingIn: isLoggingIn(state),
    hasFailed: hasFailed(state),
    hasSucceeded: hasSucceeded(state)
  }),
  {
    login
  }
)(Login);
