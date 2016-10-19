import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import ResetPasswordForm from '../../components/Forms/ResetPasswordForm';

import { resetPassword } from '../../redux/modules/auth';
import {
  isReseting,
  hasResetingFailed as hasFailed,
  hasResetingSucceeded as hasSucceeded
} from '../../redux/selectors/auth';

class ResetPassword extends Component {

  render() {
    const { links: { HOME_URI } } = this.context;
    const { instances, resetPassword, isReseting, hasFailed, hasSucceeded } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.registration.title' defaultMessage='Create a new ReCodEx account' />}
        description={<FormattedMessage id='app.registration.description' defaultMessage='Start using ReCodEx today' />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.homepage.title' />, link: HOME_URI },
          { text: <FormattedMessage id='app.registration.title' /> }
        ]}>
        <Row>
          <Col md={6} mdOffset={3} sm={8} smOffset={2}>
            <ResetPasswordForm
              onSubmit={resetPassword}
              istTryingToCreateAccount={isReseting}
              hasFailed={hasFailed}
              hasSucceeded={hasSucceeded} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

ResetPassword.contextTypes = {
  links: PropTypes.object
};

ResetPassword.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  isReseting: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    isReseting: isReseting(state),
    hasFailed: hasFailed(state),
    hasSucceeded: hasSucceeded(state)
  }),
  dispatch => ({
    resetPassword: ({ username }) =>
      dispatch(resetPassword(username)),
    push: (url) => dispatch(push(url))
  })
)(ResetPassword);
