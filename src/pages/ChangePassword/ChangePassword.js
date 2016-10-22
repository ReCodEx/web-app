import React, { Component, PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';

import { Row, Col, Alert } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import ChangePasswordForm from '../../components/Forms/ChangePasswordForm';

import { decode, isTokenValid, isInScope } from '../../redux/helpers/token';
import { changePassword } from '../../redux/modules/auth';
import {
  isChanging,
  hasChangingFailed as hasFailed,
  hasChangingSucceeded as hasSucceeded
} from '../../redux/selectors/auth';

/**
 * Component for changing old password for a new one for a user with a specific
 * token provided in the URL - user goes to this page using a link from an email.
 *
 * @class ChangePassword
 * @extends {Component}
 */
class ChangePassword extends Component {

  state = { token: null, decodedToken: null };

  /**
   * This method looks for a token in the hash part of the URL
   * -> this component needs the token to be present and valid,
   * so it must be validated properly and user redirected or warned
   * when there is something wrong.
   */
  componentWillMount = () => {
    this.checkIfIsDone(this.props);

    if (canUseDOM) {
      const hash = window.location.hash;
      if (hash.length === 0) {
        const { push } = this.props;
        const { links: { RESET_PASSWORD_URI } } = this.context;
        push(RESET_PASSWORD_URI); // no hash -> redirect to the reset form
      } else {
        let token = window.location.hash.substr(1);
        let decodedToken = decode(token);

        if (!isTokenValid(decodedToken) || !isInScope(decodedToken, 'change-password')) {
          token = null;
          decodedToken = null;
        }

        this.setState({ token, decodedToken });
      }
    }
  };

  componentWillReceiveProps = props => {
    this.checkIfIsDone(props);
  };

  /**
   * Check if the operation was not carried out successfuly and redirect the user to the next step if so.
   */
  checkIfIsDone = props => {
    const { hasSucceeded } = props;
    if (hasSucceeded) {
      setTimeout(() => {
        const { push, reset } = this.props;
        const { links: { DASHBOARD_URI } } = this.context;
        reset();
        push(DASHBOARD_URI);
      }, 1500);
    }
  };

  render() {
    const { links: { HOME_URI } } = this.context;
    const { instances, changePassword, isChanging, hasFailed, hasSucceeded } = this.props;
    const { decodedToken, token } = this.state;

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
            {!token && !decodedToken && (
              <Alert bsStyle='warning'>
                <strong><FormattedMessage id='app.changePassword.tokenExpired' defaultMessage='You cannot reset your now - your token has probably expired or the URL is broken.' /></strong>{' '}
                <FormattedMessage id='app.changePassword.requestAnotherLink' defaultMessage='Please request (another) link with an unique token.' />
              </Alert>
            )}
            {decodedToken && (
              <div>
                <ChangePasswordForm
                  onSubmit={({ password }) => changePassword(password, token)}
                  isChanging={isChanging}
                  hasFailed={hasFailed}
                  hasSucceeded={hasSucceeded} />
                <p><FormattedMessage id='app.changePassword.tokenExpiresIn' defaultMessage='Token expires: ' /> <FormattedRelative value={decodedToken.exp * 1000} /></p>
              </div>
            )}
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
    push: (url) => dispatch(push(url)),
    reset: () => dispatch(reset('changePassword'))
  })
)(ChangePassword);
