import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import Box from '../../components/AdminLTE/Box';
import RegistrationForm from '../../components/Public/RegistrationForm';

import { createAccount } from '../../redux/modules/registration';
import { fetchInstances } from '../../redux/modules/instances';
import { instancesSelector } from '../../redux/selectors/instances';
import { isCreating, hasFailed, hasSucceeded } from '../../redux/selectors/registration';
import { HOME_URI, DASHBOARD_URI } from '../../links';

class Register extends Component {

  componentWillMount = () => {
    this.checkIfIsDone(this.props);
    Register.loadData(this.props);
  };

  componentWillReceiveProps = props => {
    this.checkIfIsDone(props);
  };

  checkIfIsDone = props => {
    const { hasSucceeded, goToDashboard } = props;
    if (hasSucceeded) {
      setTimeout(() => this.context.router.push(DASHBOARD_URI), 600);
    }
  };

  static loadData = ({ fetchInstances }) => {
    fetchInstances();
  };

  render() {
    const { instances, createAccount, isCreatingAccount, hasFailed, hasSucceeded } = this.props;

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
            <RegistrationForm
              instances={instances}
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
  instances: PropTypes.object.isRequired,
  fetchInstances: PropTypes.func.isRequired,
  createAccount: PropTypes.func.isRequired,
  isCreatingAccount: PropTypes.bool.isRequired,
  hasFailed: PropTypes.bool.isRequired,
  hasSucceeded: PropTypes.bool.isRequired
};

export default connect(
  state => ({
    instances: instancesSelector(state),
    isCreatingAccount: isCreating(state),
    hasFailed: hasFailed(state),
    hasSucceeded: hasSucceeded(state)
  }),
  {
    createAccount,
    fetchInstances
  }
)(Register);
