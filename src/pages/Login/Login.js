import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/layout/PageContent';
import LoginForm from '../../components/forms/LoginForm';
import CASLoginBox from '../../containers/CAS';

import { login } from '../../redux/modules/auth';
import { isLoggedIn, selectedInstanceId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { getConfigVar, abortAllPendingRequests } from '../../redux/helpers/api/tools';

import withLinks from '../../helpers/withLinks';

const ALLOW_CAS_REGISTRATION = getConfigVar('ALLOW_CAS_REGISTRATION');

class Login extends Component {
  /**
   * Find appropriate URI for redirection after login and perform the redirect.
   * 1) Use redirect URL parameter if available.
   * 2) Use user's personal settings.
   * 3) Use system default.
   */
  redirectAfterLogin = () => {
    const {
      loggedInUser = null,
      instanceId = null,
      push,
      reset,
      params: { redirect },
      links: { HOME_URI, DASHBOARD_URI, INSTANCE_URI_FACTORY },
    } = this.props;

    let url = null;
    if (redirect) {
      url = atob(redirect);
    } else {
      const defaultPages = {
        home: HOME_URI,
        dashboard: DASHBOARD_URI,
        instance: instanceId && INSTANCE_URI_FACTORY(instanceId),
      };
      const defaultPage = loggedInUser && loggedInUser.getIn(['data', 'privateData', 'settings', 'defaultPage']);
      url = defaultPage && defaultPages[defaultPage] ? defaultPages[defaultPage] : DASHBOARD_URI; // DASHBOARD_URI is system default
    }

    /*
     * Login is slightly more complicated as the change in logged in user triggers some reloads immediately.
     * Since we are about to perform a redirect, we need to stop pending requests (wait for all FAILED actions)
     * and then perform the redirect itself. We use timer to achieve that.
     */
    abortAllPendingRequests();
    window.setTimeout(() => {
      push(url);
      reset();
    }, 100);
  };

  /**
   * Log the user in (by given credentials) and then perform the redirect.
   */
  loginAndRedirect = credentials => {
    const { login } = this.props;
    login(credentials).then(() => {
      this.redirectAfterLogin();
    });
  };

  render() {
    const {
      params: { redirect = null },
      links: { HOME_URI, RESET_PASSWORD_URI },
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id="app.login.title" defaultMessage="Sign in" />}
        description={<FormattedMessage id="app.login.description" defaultMessage="Please fill your credentials" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.homepage.title" />,
            link: HOME_URI,
            iconName: 'home',
          },
          {
            text: <FormattedMessage id="app.login.title" />,
            iconName: 'sign-in-alt',
          },
        ]}>
        <React.Fragment>
          {redirect && (
            <Row>
              <Col sm={12}>
                <div className="callout callout-warning">
                  <FormattedMessage
                    id="app.login.loginIsRequired"
                    defaultMessage="Target page is available for authorized users only. Please sign in first."
                  />
                </div>
              </Col>
            </Row>
          )}

          <Row>
            <Col
              lg={4}
              lgOffset={ALLOW_CAS_REGISTRATION ? 1 : 4}
              md={6}
              mdOffset={ALLOW_CAS_REGISTRATION ? 0 : 3}
              sm={8}
              smOffset={2}>
              <LoginForm onSubmit={this.loginAndRedirect} />
              <p className="text-center">
                <FormattedMessage
                  id="app.login.cannotRememberPassword"
                  defaultMessage="You cannot remember what your password was?"
                />{' '}
                <Link to={RESET_PASSWORD_URI}>
                  <FormattedMessage id="app.login.resetPassword" defaultMessage="Reset your password." />
                </Link>
              </p>
            </Col>
            {ALLOW_CAS_REGISTRATION && (
              <Col lg={4} lgOffset={2} md={6} mdOffset={0} sm={8} smOffset={2}>
                <CASLoginBox afterLogin={this.redirectAfterLogin} />
              </Col>
            )}
          </Row>
        </React.Fragment>
      </PageContent>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  params: PropTypes.object,
  isLoggedIn: PropTypes.bool.isRequired,
  instanceId: PropTypes.string,
  loggedInUser: ImmutablePropTypes.map,
  push: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    state => ({
      isLoggedIn: isLoggedIn(state),
      instanceId: selectedInstanceId(state),
      loggedInUser: loggedInUserSelector(state),
    }),
    dispatch => ({
      login: ({ email, password }) => dispatch(login(email, password)),
      push: url => dispatch(push(url)),
      reset: () => {
        dispatch(reset('login'));
      },
    })
  )(Login)
);
