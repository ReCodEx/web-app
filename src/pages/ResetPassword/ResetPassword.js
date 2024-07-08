import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/layout/PageContent';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm';

import { resetPassword } from '../../redux/modules/auth.js';
import {
  isReseting,
  hasResetingFailed as hasFailed,
  hasResetingSucceeded as hasSucceeded,
} from '../../redux/selectors/auth.js';

import withLinks from '../../helpers/withLinks.js';

/**
 * This component enables the user to request reseting password for his/her email address.
 */
const ResetPassword = ({ resetPassword, isReseting, hasFailed, hasSucceeded, links: { HOME_URI } }) => (
  <PageContent title={<FormattedMessage id="app.resetPassword.title" defaultMessage="Reset Password" />}>
    <Row>
      <Col md={{ span: 6, offset: 3 }} sm={{ span: 8, offset: 2 }}>
        <ResetPasswordForm
          onSubmit={resetPassword}
          istTryingToCreateAccount={isReseting}
          hasFailed={hasFailed}
          hasSucceeded={hasSucceeded}
        />
      </Col>
    </Row>
  </PageContent>
);

ResetPassword.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  isReseting: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(
  connect(
    state => ({
      isReseting: isReseting(state),
      hasFailed: hasFailed(state),
      hasSucceeded: hasSucceeded(state),
    }),
    dispatch => ({
      resetPassword: ({ username }) => dispatch(resetPassword(username)),
    })
  )(ResetPassword)
);
