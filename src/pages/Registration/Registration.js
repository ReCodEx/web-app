import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/Box';
import RegistrationForm from '../../components/RegistrationForm';

import { statusTypes, createAccount } from '../../redux/modules/registration';
import { DASHBOARD_URI } from '../../links';

class Register extends Component {

  constructor(props, context) {
    super(props, context);
    this.checkIfIsDone(props);
  }

  componentWillReceiveProps = props => this.checkIfIsDone(props);

  checkIfIsDone = props => {
    const { hasSucceeded, goToDashboard } = props;
    if (hasSucceeded) {
      setTimeout(() => this.context.router.push(DASHBOARD_URI), 600);
    }
  };

  render() {
    const { createAccount, isCreatingAccount, hasFailed, hasSucceeded } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.registration.title' defaultMessage='Create a new ReCodEx account' />}>
        <Row>
          <Col sm={6} smOffset={3}>
            <RegistrationForm
              tryCreateAccount={createAccount}
              istTryingToCreateAccount={isCreatingAccount}
              hasFailed={hasFailed}
              hasSucceeded={hasSucceeded} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

Register.contextTypes = {
  router: PropTypes.object
};

Register.propTypes = {
  createAccount: PropTypes.func.isRequired,
  isCreatingAccount: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    isCreatingAccount: state.registration.status === statusTypes.CREATING_ACCOUNT,
    hasFailed: state.registration.status === statusTypes.ACCOUNT_CREATING_FAILED,
    hasSucceeded: state.registration.status === statusTypes.ACCOUNT_CREATED
  }),
  {
    createAccount
  }
)(Register);
