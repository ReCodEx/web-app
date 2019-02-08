import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Row, Col, Alert } from 'react-bootstrap';
import Box from '../../components/widgets/Box';
import PageContent from '../../components/layout/PageContent';
import ResendVerificationEmailContainer from '../../containers/ResendVerificationEmailContainer';

import { decode, isTokenValid, isInScope } from '../../redux/helpers/token';
import { verifyEmail } from '../../redux/modules/emailVerification';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { verificationStatusSelector } from '../../redux/selectors/emailVerification';
import { LoadingIcon, SuccessIcon, FailureIcon } from '../../components/icons';

import withLinks from '../../helpers/withLinks';

/**
 * Component for changing old password for a new one for a user with a specific
 * token provided in the URL - user goes to this page using a link from an email.
 *
 * @class ChangePassword
 * @extends {Component}
 */
class EmailVerification extends Component {
  state = { token: null, decodedToken: null };

  /**
   * This method looks for a token in the hash part of the URL
   * -> this component needs the token to be present and valid,
   * so it must be validated properly and user redirected or warned
   * when there is something wrong.
   */
  componentWillMount = () => {
    if (canUseDOM) {
      const hash = window.location.hash;
      if (hash.length > 0) {
        let token = window.location.hash.substr(1);
        let decodedToken = decode(token);

        if (
          isTokenValid(decodedToken) &&
          isInScope(decodedToken, 'email-verification')
        ) {
          this.setState({ token, decodedToken });
          const { verifyEmail } = this.props;
          verifyEmail(decodedToken.sub, token);
        }
      }
    }
  };

  render() {
    const {
      userId,
      links: { HOME_URI },
      getVerificationStatus,
    } = this.props;
    const { decodedToken, token } = this.state;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.emailVerification.title"
            defaultMessage="Email verification"
          />
        }
        description={
          <FormattedMessage
            id="app.emailVerification.description"
            defaultMessage="Your email will be verified."
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.homepage.title" />,
            link: HOME_URI,
            iconName: 'home',
          },
          {
            text: <FormattedMessage id="app.emailVerification.title" />,
            iconName: 'tick',
          },
        ]}>
        <Row>
          <Col sm={8} smOffset={2} md={6} mdOffset={3} lg={4} lgOffset={4}>
            {canUseDOM && !token && !decodedToken && (
              <div>
                <Alert bsStyle="warning">
                  <strong>
                    <FormattedMessage
                      id="app.emailVerification.tokenExpired"
                      defaultMessage="The email address cannot be verified now - your token has probably expired or the URL is broken."
                    />
                  </strong>{' '}
                  <FormattedMessage
                    id="app.emailVerification.requestAnotherLink"
                    defaultMessage="Please request (another) link with a unique token."
                  />
                </Alert>
                {userId !== null && (
                  <p className="text-center">
                    <ResendVerificationEmailContainer
                      bsSize="sm"
                      userId={userId}
                    />
                  </p>
                )}
              </div>
            )}

            {decodedToken && (
              <Box
                title={
                  <FormattedMessage
                    id="app.emailVerification.progress"
                    defaultMessage="Email verification progress"
                  />
                }>
                <div>
                  {getVerificationStatus(decodedToken.sub) === 'FULFILLED' && (
                    <p>
                      <SuccessIcon gapRight />
                      <FormattedMessage
                        id="app.emailVerification.verified"
                        defaultMessage="The email address has been verified."
                      />
                    </p>
                  )}

                  {getVerificationStatus(decodedToken.sub) === 'FAILED' && (
                    <p>
                      <FailureIcon gapRight />
                      <FormattedMessage
                        id="app.emailVerification.failed"
                        defaultMessage="The email address cannot be verified."
                      />
                    </p>
                  )}

                  {getVerificationStatus(decodedToken.sub) === 'PENDING' && (
                    <p>
                      <LoadingIcon gapRight />
                      <FormattedMessage
                        id="app.emailVerification.waiting"
                        defaultMessage="The email address is being verified."
                      />
                    </p>
                  )}
                </div>
              </Box>
            )}
          </Col>
        </Row>
      </PageContent>
    );
  }
}

EmailVerification.propTypes = {
  getVerificationStatus: PropTypes.func.isRequired,
  userId: PropTypes.string,
  verifyEmail: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
};

export default withLinks(
  connect(
    state => ({
      userId: loggedInUserIdSelector(state),
      getVerificationStatus: userId =>
        verificationStatusSelector(userId)(state),
    }),
    dispatch => ({
      verifyEmail: (userId, token) => dispatch(verifyEmail(userId, token)),
      push: url => dispatch(push(url)),
    })
  )(EmailVerification)
);
