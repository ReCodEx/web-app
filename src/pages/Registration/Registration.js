import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { reset, startAsyncValidation } from 'redux-form';

import { Row, Col } from 'react-bootstrap';
import PageContent from '../../components/layout/PageContent';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import RegistrationForm from '../../components/forms/RegistrationForm';
import ExternalRegistrationForm from '../../components/forms/ExternalRegistrationForm';
import RegistrationCAS from '../../components/forms/RegistrationCAS';

import {
  createAccount,
  createExternalAccount
} from '../../redux/modules/registration';
import { fetchInstances } from '../../redux/modules/instances';
import { publicInstancesSelector } from '../../redux/selectors/instances';
import { hasSucceeded } from '../../redux/selectors/registration';

import { getConfigVar } from '../../redux/helpers/api/tools';
import withLinks from '../../helpers/withLinks';

// Configuration properties
const ALLOW_NORMAL_REGISTRATION = getConfigVar('ALLOW_NORMAL_REGISTRATION');
const ALLOW_LDAP_REGISTRATION = getConfigVar('ALLOW_LDAP_REGISTRATION');
const ALLOW_CAS_REGISTRATION = getConfigVar('ALLOW_CAS_REGISTRATION');

class Registration extends Component {
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
        <ResourceRenderer resource={instances.toArray()} returnAsArray>
          {instances =>
            <Row>
              {ALLOW_NORMAL_REGISTRATION === 'true' &&
                <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
                  <RegistrationForm
                    instances={instances}
                    onSubmit={createAccount}
                  />
                </Col>}
              {ALLOW_LDAP_REGISTRATION === 'true' &&
                <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
                  <ExternalRegistrationForm
                    instances={instances}
                    onSubmit={createExternalAccount()}
                  />
                </Col>}
              {ALLOW_CAS_REGISTRATION === 'true' &&
                <Col lg={4} md={6} mdOffset={0} sm={8} smOffset={2}>
                  <RegistrationCAS
                    instances={instances}
                    onSubmit={createExternalAccount('cas')}
                  />
                </Col>}
            </Row>}
        </ResourceRenderer>
      </PageContent>
    );
  }
}

Registration.propTypes = {
  instances: ImmutablePropTypes.map.isRequired,
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
      createAccount: ({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        instanceId
      }) =>
        dispatch(
          createAccount(
            firstName,
            lastName,
            email,
            password,
            passwordConfirm,
            instanceId
          )
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
  )(Registration)
);
