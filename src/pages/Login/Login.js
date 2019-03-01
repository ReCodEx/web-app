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
import { getConfigVar } from '../../redux/helpers/api/tools';

import withLinks from '../../helpers/withLinks';

const ALLOW_CAS_REGISTRATION = getConfigVar('ALLOW_CAS_REGISTRATION');

class Login extends Component {
  componentWillMount = () => {
    this.checkIfIsLoggedIn(this.props);
  };

  componentWillReceiveProps = props => this.checkIfIsLoggedIn(props);

  /**
   * Find appropriate URI for redirect after login.
   * 1) Use redirect URL parameter if available.
   * 2) Use user's personal settings.
   * 3) Use system default.
   */
  getRedirectURI = ({
    loggedInUser = null,
    instanceId = null,
    params: { redirect },
    links: { HOME_URI, DASHBOARD_URI, INSTANCE_URI_FACTORY },
  }) => {
    if (redirect) {
      return atob(redirect);
    }

    const defaultPages = {
      home: HOME_URI,
      dashboard: DASHBOARD_URI,
      instance: instanceId && INSTANCE_URI_FACTORY(instanceId),
    };
    const defaultPage = loggedInUser && loggedInUser.getIn(['data', 'privateData', 'settings', 'defaultPage']);
    return defaultPage && defaultPages[defaultPage] ? defaultPages[defaultPage] : DASHBOARD_URI; // system default
  };

  /**
   * Redirect all logged in users to the dashboard as soon as they are visually informed about success.
   */
  checkIfIsLoggedIn = ({ isLoggedIn, push, reset, ...props }) => {
    if (isLoggedIn) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        push(this.getRedirectURI(props));
        reset();
      }, 600);
    }
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    const {
      login,
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
              <LoginForm onSubmit={login} />
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
                <CASLoginBox />
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
