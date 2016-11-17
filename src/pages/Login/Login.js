import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import LoginForm from '../../components/Forms/LoginForm';
import LoginCASForm from '../../components/Forms/LoginCASForm';

import { login, loginCAS } from '../../redux/modules/auth';
import { isLoggingIn, hasFailed, hasSucceeded } from '../../redux/selectors/auth';

class Login extends Component {

  componentWillMount = () => {
    this.checkIfIsLoggedIn(this.props);
  }

  componentWillReceiveProps = (props) =>
    this.checkIfIsLoggedIn(props);

  /**
   * Redirect all logged in users to the dashboard as soon as they are visually informed about success.
   */
  checkIfIsLoggedIn = (props) => {
    const { hasSucceeded, push } = props;
    if (hasSucceeded) {
      setTimeout(() => push(this.context.links.DASHBOARD_URI), 600);
    }
  };

  render() {
    const { login, loginCAS, hasSucceeded } = this.props;
    const { links: { HOME_URI, RESET_PASSWORD_URI } } = this.context;

    return (
      <PageContent
        title={<FormattedMessage id='app.login.title' defaultMessage='Sign in' />}
        description={<FormattedMessage id='app.login.description' defaultMessage='Please fill your credentials' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.homepage.title' />,
            link: HOME_URI,
            iconName: 'home'
          },
          {
            text: <FormattedMessage id='app.login.title' />,
            iconName: 'sign-in'
          }
        ]}>
        <Row>
          <Col lg={4} lgOffset={1} md={6} mdOffset={0} sm={8} smOffset={2}>
            <LoginForm onSubmit={login} hasSucceeded={hasSucceeded} />
            <p className='text-center'>
              <FormattedMessage id='app.login.cannotRememberPassword' defaultMessage='You cannot remember what your password was?' />{' '}<Link to={RESET_PASSWORD_URI}><FormattedMessage id='app.login.resetPassword' defaultMessage='Reset your password.' /></Link>
            </p>
          </Col>
          <Col lg={4} lgOffset={1} md={6} mdOffset={0} sm={8} smOffset={2}>
            <LoginCASForm onSubmit={loginCAS} hasSucceeded={hasSucceeded} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

Login.contextTypes = {
  links: PropTypes.object
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    hasSucceeded: hasSucceeded(state)
  }),
  dispatch => ({
    login: ({ email, password }) => dispatch(login(email, password)),
    loginCAS: ({ ukco, password }) => dispatch(loginCAS(ukco, password)),
    push: (url) => dispatch(push(url))
  })
)(Login);
