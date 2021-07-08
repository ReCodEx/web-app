import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import ChangePasswordForm from '../../components/forms/ChangePasswordForm';
import Callout from '../../components/widgets/Callout';
import { decode, isTokenValid, isInScope } from '../../redux/helpers/token';
import { changePassword } from '../../redux/modules/auth';
import {
  isChanging,
  hasChangingFailed as hasFailed,
  hasChangingSucceeded as hasSucceeded,
} from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';

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
  componentDidMount() {
    this.checkIfIsDone(this.props);

    if (canUseDOM) {
      const search = window.location.search;
      if (search.length === 0) {
        const {
          history: { replace },
          links: { RESET_PASSWORD_URI },
        } = this.props;
        replace(RESET_PASSWORD_URI); // no token in URL query -> redirect to the reset form
      } else {
        let token = search.substr(1);
        let decodedToken = decode(token);

        if (!isTokenValid(decodedToken) || !isInScope(decodedToken, 'change-password')) {
          token = null;
          decodedToken = null;
        }

        this.setState({ token, decodedToken });
      }
    }
  }

  componentDidUpdate = () => this.checkIfIsDone(this.props);

  /**
   * Check if the operation was not carried out successfuly and redirect the user to the next step if so.
   */
  checkIfIsDone = props => {
    const { hasSucceeded } = props;
    if (hasSucceeded) {
      this.timeout = setTimeout(() => {
        const {
          reset,
          history: { replace },
          links: { DASHBOARD_URI },
        } = this.props;
        this.timeout = null;
        reset();
        replace(DASHBOARD_URI);
      }, 1500);
    }
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    const {
      links: { HOME_URI },
      changePassword,
      isChanging,
      hasFailed,
      hasSucceeded,
    } = this.props;
    const { decodedToken, token } = this.state;

    return (
      <PageContent
        title={<FormattedMessage id="app.changePassword.title" defaultMessage="Change forgotten password" />}
        description={
          <FormattedMessage
            id="app.changePassword.description"
            defaultMessage="You can change your forgotten password in this form"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.homepage.title" defaultMessage="ReCodEx — ReCodEx Code Examiner" />,
            link: HOME_URI,
            iconName: 'home',
          },
          {
            text: <FormattedMessage id="app.changePassword.title" defaultMessage="Change forgotten password" />,
            iconName: 'shield-alt',
          },
        ]}>
        <Row>
          <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
            {!token && !decodedToken && (
              <Callout variant="warning">
                <strong>
                  <FormattedMessage
                    id="app.changePassword.tokenExpired"
                    defaultMessage="You cannot reset your password now - your token has probably expired or the URL is broken."
                  />
                </strong>{' '}
                <FormattedMessage
                  id="app.changePassword.requestAnotherLink"
                  defaultMessage="Please request (another) link with an unique token."
                />
              </Callout>
            )}
            {decodedToken && (
              <div>
                <ChangePasswordForm
                  onSubmit={({ password }) => changePassword(password, token)}
                  isChanging={isChanging}
                  hasFailed={hasFailed}
                  hasSucceeded={hasSucceeded}
                />
                <p>
                  <FormattedMessage id="app.changePassword.tokenExpiresIn" defaultMessage="Token expires: " />{' '}
                  <FormattedRelativeTime value={Date.now() / 1000 - decodedToken.exp} units="seconds" />
                </p>
              </div>
            )}
          </Col>
        </Row>
      </PageContent>
    );
  }
}

ChangePassword.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  isChanging: PropTypes.bool,
  changePassword: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired,
  links: PropTypes.object,
};

export default withLinks(
  connect(
    state => ({
      isChanging: isChanging(state),
      hasFailed: hasFailed(state),
      hasSucceeded: hasSucceeded(state),
    }),
    dispatch => ({
      changePassword: (password, accessToken) => dispatch(changePassword(password, accessToken)),
      reset: () => dispatch(reset('changePassword')),
    })
  )(ChangePassword)
);
