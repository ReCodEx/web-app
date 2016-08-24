import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'react-fontawesome';
import FormBox from '../../AdminLTE/FormBox';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Alert
} from 'react-bootstrap';

class RegistrationForm extends Component {

  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    instanceId: '',
    hasFailed: false
  };

  componentWillReceiveProps = newProps => {
    this.setState({ hasFailed: newProps.hasFailed === true });
    if (this.state.instanceId.length === 0 && newProps.instances.size > 0) {
      this.setState({ instanceId: newProps.instances.toArray()[0].getIn(['data', 'id']) });
    }
  };

  changeValue = (name, value) => {
    this.setState({ [name]: value, hasFailed: false });
  };

  tryCreateAccount = e => {
    e.preventDefault();
    const { tryCreateAccount } = this.props;
    const { firstName, lastName, email, password, instanceId } = this.state;
    tryCreateAccount(firstName, lastName, email, password, instanceId);
  };

  render() {
    const {
      istTryingToCreateAccount = false,
      hasSucceeded = false,
      instances
    } = this.props;

    const {
      hasFailed = false,
      firstName,
      lastName,
      email,
      password
    } = this.state;

    const isEmpty = firstName.length === 0 ||
                    lastName.length === 0 ||
                    email.length === 0 ||
                    password.length === 0;

    const type = hasFailed ? 'danger' : hasSucceeded ? 'success' : undefined;

    const btnContent = !istTryingToCreateAccount
                        ? hasSucceeded
                          ? <span><Icon name='check' /> &nbsp; <FormattedMessage id='app.registrationForm.success' defaultMessage='Your account has been created.' /></span>
                          : <FormattedMessage id='app.registrationForm.createAccount' defaultMessage='Create account' />
                        : <span><Icon name='circle-o-notch' spin /> &nbsp; <FormattedMessage id='app.registrationForm.processing' defaultMessage='Creating account ...' /></span>;

    return (
      <FormBox
        title={<FormattedMessage id='app.registrationForm.title' defaultMessage='Create ReCodEx account' />}
        type={type}
        footer={
          <div className='text-center'>
            <Button
              type='submit'
              bsStyle={hasFailed ? 'default' : 'success'}
              className='btn-flat'
              disabled={istTryingToCreateAccount || isEmpty || hasSucceeded}
              onClick={this.tryCreateAccount}>
              {btnContent}
            </Button>
          </div>
        }>
          <span>
            {hasFailed && (
              <Alert bsStyle='danger'>
                <FormattedMessage id='app.registrationForm.failed' defaultMessage='Registration failed. Please check your information.' />
              </Alert>)}
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.registrationForm.firstName' defaultMessage='First name:' /></ControlLabel>
              <FormControl type='text' onChange={e => this.changeValue('firstName', e.target.value)} disabled={istTryingToCreateAccount || hasSucceeded} />
            </FormGroup>
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.registrationForm.lastName' defaultMessage='Last name:' /></ControlLabel>
              <FormControl type='text' onChange={e => this.changeValue('lastName', e.target.value)} disabled={istTryingToCreateAccount || hasSucceeded} />
            </FormGroup>
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.registrationForm.email' defaultMessage='E-mail address:' /></ControlLabel>
              <FormControl type='email' onChange={e => this.changeValue('email', e.target.value)} disabled={istTryingToCreateAccount || hasSucceeded} />
            </FormGroup>
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.registrationForm.password' defaultMessage='Password:' /></ControlLabel>
              <FormControl type='password' onChange={e => this.changeValue('password', e.target.value)} disabled={istTryingToCreateAccount || hasSucceeded} />
            </FormGroup>
            <FormGroup validationState={hasFailed === true ? 'error' : undefined}>
              <ControlLabel><FormattedMessage id='app.registrationForm.instance' defaultMessage='Instance:' /></ControlLabel>
              <FormControl componentClass='select' onChange={e => this.changeValue('instanceId', e.target.value)} disabled={istTryingToCreateAccount || hasSucceeded}>
                {instances.toArray().map(instance =>
                  <option value={instance.getIn(['data', 'id'])} key={instance.getIn(['data', 'id'])}>
                    {instance.getIn(['data', 'name'])}
                  </option>
                )}
              </FormControl>
            </FormGroup>
          </span>
        </FormBox>
    );
  }
}

RegistrationForm.propTypes = {
  instances: PropTypes.object.isRequired,
  tryCreateAccount: PropTypes.func.isRequired,
  istTryingToCreateAccount: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool
};

export default RegistrationForm;
