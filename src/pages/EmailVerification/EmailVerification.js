import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
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
 * @class EmailVerification
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
  componentDidMount = () => {
    if (canUseDOM) {
      const search = window.location.search;
      if (search.length > 0) {
        const token = search.substr(1);
        const decodedToken = decode(token);

        if (isTokenValid(decodedToken) && isInScope(decodedToken, 'email-verification')) {
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
        title={<FormattedMessage id="app.emailVerification.title" defaultMessage="Email verification" />}
        description={
          <FormattedMessage id="app.emailVerification.description" defaultMessage="Your email will be verified." />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.homepage.title" defaultMessage="ReCodEx — Code Examiner" />,
            link: HOME_URI,
            iconName: 'home',
          },
          {
            text: <FormattedMessage id="app.emailVerification.title" defaultMessage="Email verification" />,
            iconName: 'tick',
          },
        ]}>
        <Row>
          <Col sm={{ span: 8, offset: 2 }} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            {canUseDOM && !token && !decodedToken && (
              <div>
                <Callout variant="warning">
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
                </Callout>
                {userId !== null && (
                  <p className="text-center">
                    <ResendVerificationEmailContainer size="sm" userId={userId} />
                  </p>
                )}
              </div>
            )}

            {decodedToken && (
              <Box
                title={
                  <FormattedMessage id="app.emailVerification.progress" defaultMessage="Email verification progress" />
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
  links: PropTypes.object,
};

export default withLinks(
  connect(
    state => ({
      userId: loggedInUserIdSelector(state),
      getVerificationStatus: userId => verificationStatusSelector(userId)(state),
    }),
    dispatch => ({
      verifyEmail: (userId, token) => dispatch(verifyEmail(userId, token)),
    })
  )(EmailVerification)
);
