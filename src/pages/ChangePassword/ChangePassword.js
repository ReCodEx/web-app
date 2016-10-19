import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import decodeJwt from 'jwt-decode';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import ChangePasswordForm from '../../components/Forms/ChangePasswordForm';

import { changePassword } from '../../redux/modules/auth';
import {
  isChanging,
  hasChaingingFailed as hasFailed,
  hasChaingingSucceded as hasSucceeded
} from '../../redux/selectors/auth';

export const isTokenValid = token =>
  token && token.get('exp') * 1000 > Date.now();

const isValidAndHasCorrectScope = (token) => {
  if (token) {
    try {
      const decodedToken = decodeJwt(token);
      return isTokenValid(decodedToken) &&
        decodedToken.scopes &&
        decodedToken.scopes.indexOf('change-password') >= 0;
    } catch (e) {
      return false;
    }
  }

  return false;
};

class ChangePassword extends Component {

  state = { token: null };

  componentWillMount = () => {
    this.checkIfIsDone(this.props);

    if (typeof window !== 'undefined' && typeof window.location.hash === 'string') {
      const token = window.location.hash.substr(1);

      if (!isValidAndHasCorrectScope(token)) {
        // @todo: Redirect the user somewhere...
      }

      this.setState({ token });
    }
  };

  componentWillReceiveProps = props => {
    this.checkIfIsDone(props);
  };

  checkIfIsDone = props => {
    const { hasSucceeded, push } = props;
    if (hasSucceeded) {
      const { links: { DASHBOARD_URI } } = this.context;
      console.log(push);
      console.log(DASHBOARD_URI);
      setTimeout(() => push(DASHBOARD_URI), 600);
    }
  };

  render() {
    const { links: { HOME_URI } } = this.context;
    const { instances, createAccount, isChanging, hasFailed, hasSucceeded } = this.props;
    const { token } = this.state;

    return (
      <PageContent
        title={<FormattedMessage id='app.changePassword.title' defaultMessage='Change forgotten password' />}
        description={<FormattedMessage id='app.changePassword.description' defaultMessage='You can change your forgotten password in this form' />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.homepage.title' />, link: HOME_URI },
          { text: <FormattedMessage id='app.changePassword.title' /> }
        ]}>
        <Row>
          <Col md={6} mdOffset={3} sm={8} smOffset={2}>
            <ChangePasswordForm
              onSubmit={({ password }) => changePassword(password, token)}
              isChanging={isChanging}
              hasFailed={hasFailed}
              hasSucceeded={hasSucceeded} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

ChangePassword.contextTypes = {
  links: PropTypes.object
};

ChangePassword.propTypes = {
  changePassword: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    isChanging: isChanging(state),
    hasFailed: hasFailed(state),
    hasSucceeded: hasSucceeded(state)
  }),
  dispatch => ({
    changePassword: (password, accessToken) =>
      dispatch(changePassword(password, accessToken)),
    push: (url) => dispatch(push(url))
  })
)(ChangePassword);
