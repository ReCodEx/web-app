import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, startAsyncValidation } from 'redux-form';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/PageContent';
import RegistrationForm from '../../components/Forms/RegistrationForm';
import ExternalRegistrationForm from '../../components/Forms/ExternalRegistrationForm';

import { createAccount, createExternalAccount } from '../../redux/modules/registration';
import { fetchInstances } from '../../redux/modules/instances';
import { publicInstancesSelector } from '../../redux/selectors/instances';
import { hasSucceeded } from '../../redux/selectors/registration';

class Register extends Component {

  componentWillMount = () => {
    this.checkIfIsDone(this.props);
    this.props.loadAsync();
  };

  componentWillReceiveProps = (props) =>
    this.checkIfIsDone(props);

  checkIfIsDone = props => {
    const { hasSucceeded, push, reset } = props;
    if (hasSucceeded) {
      const { links: { DASHBOARD_URI } } = this.context;
      setTimeout(() => {
        push(DASHBOARD_URI);
        reset();
      }, 600);
    }
  };

  render() {
    const { links: { HOME_URI } } = this.context;
    const { instances, createAccount, createExternalAccount } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.registration.title' defaultMessage='Create a new ReCodEx account' />}
        description={<FormattedMessage id='app.registration.description' defaultMessage='Start using ReCodEx today' />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.homepage.title' />,
            link: HOME_URI,
            iconName: 'home'
          },
          {
            text: <FormattedMessage id='app.registration.title' />,
            iconName: 'user-plus'
          }
        ]}>
        <Row>
          <Col lg={4} lgOffset={1} md={6} mdOffset={0} sm={8} smOffset={2}>
            <RegistrationForm instances={instances} onSubmit={createAccount} />
          </Col>
          <Col lg={4} lgOffset={1} md={6} mdOffset={0} sm={8} smOffset={2}>
            <ExternalRegistrationForm instances={instances} onSubmit={createExternalAccount} />
          </Col>
        </Row>
      </PageContent>
    );
  }

}

Register.contextTypes = {
  links: PropTypes.object
};

Register.propTypes = {
  instances: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  createAccount: PropTypes.func.isRequired,
  createExternalAccount: PropTypes.func.isRequired,
  hasSucceeded: PropTypes.bool,
  push: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  triggerAsyncValidation: PropTypes.func.isRequired
};

export default connect(
  state => ({
    instances: publicInstancesSelector(state),
    hasSucceeded: hasSucceeded(state)
  }),
  dispatch => ({
    loadAsync: () => Promise.all([
      dispatch(fetchInstances())
    ]),
    createAccount: ({ firstName, lastName, email, password, instanceId }) =>
      dispatch(createAccount(firstName, lastName, email, password, instanceId)),
    createExternalAccount: ({ username, password, instanceId, serviceId }) =>
      dispatch(createExternalAccount(username, password, instanceId, serviceId)),
    push: (url) => dispatch(push(url)),
    triggerAsyncValidation: () => dispatch(startAsyncValidation('registration')),
    reset: () => {
      dispatch(reset('registration'));
      dispatch(reset('external-registration'));
    }
  })
)(Register);
