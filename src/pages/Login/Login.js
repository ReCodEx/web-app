import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { reset, SubmissionError } from 'redux-form';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import LoginForm from '../../components/forms/LoginForm';
import ExternalLoginBox from '../../containers/ExternalLogin';
import Callout from '../../components/widgets/Callout';

import { login } from '../../redux/modules/auth';
import { isLoggedIn, selectedInstanceId } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { getConfigVar, getConfigVarLocalized } from '../../helpers/config';
import { getErrorMessage } from '../../locales/apiErrorMessages';

import withLinks from '../../helpers/withLinks';

const EXTERNAL_AUTH_URL = getConfigVar('EXTERNAL_AUTH_URL');
const EXTERNAL_AUTH_SERVICE_ID = getConfigVar('EXTERNAL_AUTH_SERVICE_ID');
const EXTERNAL_AUTH_HELPDESK_URL = getConfigVar('EXTERNAL_AUTH_HELPDESK_URL');

class Login extends Component {
  /**
   * Find appropriate URI for redirection after login and perform the redirect.
   * 1) Use redirect URL parameter if available.
   * 2) Use user's personal settings.
   * 3) If the user does not have verified email, go to settings.
   * 4) Use system default.
   */
  redirectAfterLogin = () => {
    const {
      loggedInUser = null,
      instanceId = null,
      reset,
      match: {
        params: { redirect },
      },
      history: { replace },
      links: { HOME_URI, DASHBOARD_URI, INSTANCE_URI_FACTORY, EDIT_USER_URI_FACTORY },
    } = this.props;

    // Reset the login form (so it is fresh for next time)
    reset();

    let url = null;
    if (redirect) {
      url = atob(decodeURIComponent(redirect));
    } else {
      const defaultPages = {
        home: HOME_URI,
        dashboard: DASHBOARD_URI,
        instance: instanceId && INSTANCE_URI_FACTORY(instanceId),
      };
      const defaultPage = loggedInUser && loggedInUser.getIn(['data', 'privateData', 'uiData', 'defaultPage']);
      url =
        defaultPage && defaultPages[defaultPage]
          ? defaultPages[defaultPage]
          : loggedInUser && loggedInUser.getIn(['data', 'isVerified']) === false
          ? EDIT_USER_URI_FACTORY(loggedInUser.getIn(['data', 'id']))
          : DASHBOARD_URI; // system default
    }

    // Redirect
    replace(url);
  };

  /**
   * Log the user in (by given credentials) and then perform the redirect.
   */
  loginAndRedirect = credentials => {
    const {
      login,
      intl: { formatMessage },
    } = this.props;
    return login(credentials)
      .then(this.redirectAfterLogin)
      .catch(e =>
        // Translate fetch response error into form error message...
        e.json().then(body => {
          throw new SubmissionError({ _error: getErrorMessage(formatMessage)(body && body.error) });
        })
      );
  };

  render() {
    const {
      isLoggedIn,
      match: {
        params: { redirect = null },
      },
      links: { RESET_PASSWORD_URI },
      intl: { locale },
    } = this.props;

    const external = EXTERNAL_AUTH_URL && EXTERNAL_AUTH_SERVICE_ID;

    return (
      <PageContent icon="sign-in-alt" title={<FormattedMessage id="app.login.title" defaultMessage="Sign In" />}>
        <>
          {redirect && (
            <Row>
              <Col sm={12}>
                <Callout variant="warning">
                  <FormattedMessage
                    id="app.login.loginIsRequired"
                    defaultMessage="Target page is available for authorized users only. Please sign in first."
                  />
                </Callout>
              </Col>
            </Row>
          )}

          {isLoggedIn && (
            <Row>
              <Col sm={12}>
                <Callout variant="success">
                  <FormattedMessage id="app.login.alreadyLoggedIn" defaultMessage="You are already logged in." />
                </Callout>
              </Col>
            </Row>
          )}

          {!isLoggedIn && (
            <Row>
              <Col
                lg={{ span: 4, offset: external ? 1 : 4 }}
                md={{ span: 6, offset: external ? 0 : 3 }}
                sm={{ span: 10, offset: 2 }}
                xs={{ spna: 12, offset: 0 }}>
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

              {external && (
                <Col
                  lg={{ span: 4, offset: 2 }}
                  md={{ span: 6, offset: 0 }}
                  sm={{ span: 10, offset: 2 }}
                  xs={{ span: 12, offset: 0 }}>
                  <ExternalLoginBox
                    name={getConfigVarLocalized('EXTERNAL_AUTH_NAME', locale)}
                    url={EXTERNAL_AUTH_URL}
                    service={EXTERNAL_AUTH_SERVICE_ID}
                    helpUrl={EXTERNAL_AUTH_HELPDESK_URL}
                    afterLogin={this.redirectAfterLogin}
                  />
                </Col>
              )}
            </Row>
          )}
        </>
      </PageContent>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      redirect: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  isLoggedIn: PropTypes.bool.isRequired,
  instanceId: PropTypes.string,
  loggedInUser: ImmutablePropTypes.map,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.object,
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
      reset: () => {
        dispatch(reset('login'));
      },
    })
  )(injectIntl(Login))
);
