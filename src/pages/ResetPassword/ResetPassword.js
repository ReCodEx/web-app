import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/layout/PageContent';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm';

import { resetPassword } from '../../redux/modules/auth';
import {
  isReseting,
  hasResetingFailed as hasFailed,
  hasResetingSucceeded as hasSucceeded,
} from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';

/**
 * This component enables the user to request reseting password for his/her email address.
 */
const ResetPassword = ({
  resetPassword,
  isReseting,
  hasFailed,
  hasSucceeded,
  links: { HOME_URI },
}) => (
  <PageContent
    title={
      <FormattedMessage
        id="app.resetPassword.title"
        defaultMessage="Reset password"
      />
    }
    description={
      <FormattedMessage
        id="app.resetPassword.description"
        defaultMessage="Change your password if you have forgotten your old one."
      />
    }
    breadcrumbs={[
      {
        text: <FormattedMessage id="app.homepage.title" />,
        link: HOME_URI,
        iconName: 'home',
      },
      {
        text: <FormattedMessage id="app.resetPassword.title" />,
        iconName: 'key',
      },
    ]}>
    <Row>
      <Col md={6} mdOffset={3} sm={8} smOffset={2}>
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
      push: url => dispatch(push(url)),
    })
  )(ResetPassword)
);
