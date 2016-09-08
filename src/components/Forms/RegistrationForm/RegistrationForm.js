import React, { PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import Icon from 'react-fontawesome';
import FormBox from '../../AdminLTE/FormBox';
import { EmailField, TextField, PasswordField, SelectField } from '../Fields';
import { createApiCallPromise } from '../../../redux/middleware/apiMiddleware';

const RegistrationForm = ({
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  instances,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.registrationForm.title' defaultMessage='Create ReCodEx account' />}
    onSubmit={handleSubmit}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <Button
          type='submit'
          bsStyle='success'
          className='btn-flat'
          disabled={invalid || submitting || hasSucceeded}>
          {!submitting
            ? hasSucceeded
              ? <span><Icon name='check' /> &nbsp; <FormattedMessage id='app.registrationForm.success' defaultMessage='Your account has been created.' /></span>
              : <FormattedMessage id='app.registrationForm.createAccount' defaultMessage='Create account' />
            : <span><Icon name='circle-o-notch' spin /> &nbsp; <FormattedMessage id='app.registrationForm.processing' defaultMessage='Creating account ...' /></span>}
        </Button>
      </div>
    }>
      <span>
        {hasFailed && (
          <Alert bsStyle='danger'>
            <FormattedMessage id='app.registrationForm.failed' defaultMessage='Registration failed. Please check your information.' />
          </Alert>)}

        <Field name='firstName' required component={TextField} label={<FormattedMessage id='app.registrationForm.firstName' defaultMessage='First name:' />} />
        <Field name='lastName' required component={TextField} label={<FormattedMessage id='app.registrationForm.lastName' defaultMessage='Last name:' />} />
        <Field name='email' required component={EmailField} label={<FormattedMessage id='app.registrationForm.email' defaultMessage='E-mail address:' />} />
        <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.registrationForm.password' defaultMessage='Password:' />} />
        <Field
          name='instanceId'
          required
          component={SelectField}
          label={<FormattedMessage id='app.registrationForm.instance' defaultMessage='Instance:' />}
          options={instances.map(
            instance => ({ key: instance.getIn(['data', 'id']), name: instance.getIn(['data', 'name']) })
          ).toArray()} />
      </span>
    </FormBox>
);

RegistrationForm.propTypes = {
  instances: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  istTryingToCreateAccount: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool
};

const validate = ({ firstName, lastName, email, password }) => {
  const errors = {};

  if (!firstName) {
    errors['firstName'] = <FormattedMessage id='app.registrationForm.validation.emptyFirstName' defaultMessage='First name cannot be empty.' />;
  }

  if (!lastName) {
    errors['lastName'] = <FormattedMessage id='app.registrationForm.validation.emptyLastName' defaultMessage='Last name cannot be empty.' />;
  }

  if (!email) {
    errors['email'] = <FormattedMessage id='app.registrationForm.validation.emptyEmail' defaultMessage='E-mail address cannot be empty.' />;
  } else if (!isEmail(email)) {
    errors['email'] = <FormattedMessage id='app.registrationForm.validation.emailIsNotAnEmail' defaultMessage='E-mail address is not valid.' />;
  }

  if (!password) {
    errors['password'] = <FormattedMessage id='app.registrationForm.validation.emptyPassword' defaultMessage='Password cannot be empty.' />;
  }

  return errors;
};

const asyncValidate = ({ email = '', password = '' }) =>
  createApiCallPromise({
    endpoint: '/users/validate-registration-data',
    method: 'POST',
    body: { email, password }
  }).then(({ usernameIsFree, passwordScore }) => {
    const errors = {};
    if (usernameIsFree === false) {
      errors['email'] = <FormattedMessage id='app.registrationForm.validation.emailAlreadyTaken' defaultMessage='This email address is already taken by another user.' />;
    }

    if (passwordScore <= 0) {
      errors['password'] = <FormattedMessage id='app.registrationForm.validation.passwordTooWeak' defaultMessage='The password you chose is too weak, please choose a different one.' />;
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  });

export default reduxForm({
  form: 'registration',
  validate,
  asyncValidate,
  asyncBlurFields: [ 'email', 'password' ]
})(RegistrationForm);
