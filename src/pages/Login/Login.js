import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { isLoggedIn } from '../../redux/selectors/auth';
import { getConfigVar } from '../../redux/helpers/api/tools';

import withLinks from '../../helpers/withLinks';

const ALLOW_CAS_REGISTRATION = getConfigVar('ALLOW_CAS_REGISTRATION');

class Login extends Component {
  componentWillMount = () => {
    this.checkIfIsLoggedIn(this.props);
  };

  componentWillReceiveProps = props => this.checkIfIsLoggedIn(props);

  /**
   * Redirect all logged in users to the dashboard as soon as they are visually informed about success.
   */
  checkIfIsLoggedIn = ({ isLoggedIn, push, reset, links: { DASHBOARD_URI } }) => {
    if (isLoggedIn) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        push(DASHBOARD_URI);
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
      </PageContent>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  push: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    state => ({
      isLoggedIn: isLoggedIn(state),
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
