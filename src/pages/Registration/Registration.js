import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, startAsyncValidation } from 'redux-form';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/layout/PageContent';
import RegistrationForm from '../../components/forms/RegistrationForm';
import ExternalRegistrationForm from '../../components/forms/ExternalRegistrationForm';
import RegistrationCASOauth from '../../components/forms/RegistrationCASOauth';

import {
  createAccount,
  createExternalAccount
} from '../../redux/modules/registration';
import { fetchInstances } from '../../redux/modules/instances';
import { publicInstancesSelector } from '../../redux/selectors/instances';
import { hasSucceeded } from '../../redux/selectors/registration';

import withLinks from '../../hoc/withLinks';

class Register extends Component {
  componentWillMount = () => {
    this.checkIfIsDone(this.props);
    this.props.loadAsync();
  };

  componentWillReceiveProps = props => this.checkIfIsDone(props);

  checkIfIsDone = ({ hasSucceeded, push, reset, links: { DASHBOARD_URI } }) => {
    if (hasSucceeded) {
      setTimeout(() => {
        push(DASHBOARD_URI);
        reset();
      }, 600);
    }
  };

  render() {
    const {
      instances,
      createAccount,
      createExternalAccount,
      links: { HOME_URI }
    } = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.registration.title"
            defaultMessage="Create a new ReCodEx account"
          />
        }
        description={
          <FormattedMessage
            id="app.registration.description"
            defaultMessage="Start using ReCodEx today"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.homepage.title" />,
            link: HOME_URI,
            iconName: 'home'
          },
          {
            text: <FormattedMessage id="app.registration.title" />,
            iconName: 'user-plus'
          }
        ]}
      >
        <Row>
          <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
            <RegistrationForm instances={instances} onSubmit={createAccount} />
          </Col>
          <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
            <ExternalRegistrationForm
              instances={instances}
              onSubmit={createExternalAccount()}
            />
          </Col>
          <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
            <RegistrationCASOauth
              instances={instances}
              onSubmit={createExternalAccount('oauth')}
            />
          </Col>
        </Row>
      </PageContent>
    );
  }
}

Register.propTypes = {
  instances: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  createAccount: PropTypes.func.isRequired,
  createExternalAccount: PropTypes.func.isRequired,
  hasSucceeded: PropTypes.bool,
  push: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  triggerAsyncValidation: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(
  connect(
    state => ({
      instances: publicInstancesSelector(state),
      hasSucceeded: hasSucceeded(state)
    }),
    dispatch => ({
      loadAsync: () => Promise.all([dispatch(fetchInstances())]),
      createAccount: ({ firstName, lastName, email, password, instanceId }) =>
        dispatch(
          createAccount(firstName, lastName, email, password, instanceId)
        ),
      createExternalAccount: (authType = 'default') => ({
        instanceId,
        serviceId,
        ...credentials
      }) =>
        dispatch(
          createExternalAccount(instanceId, serviceId, credentials, authType)
        ),
      push: url => dispatch(push(url)),
      triggerAsyncValidation: () =>
        dispatch(startAsyncValidation('registration')),
      reset: () => {
        dispatch(reset('registration'));
        dispatch(reset('external-registration'));
      }
    })
  )(Register)
);
