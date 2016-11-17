import React, { PropTypes } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import { LoadingIcon, SuccessIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { EmailField, TextField, PasswordField, PasswordStrength, SelectField } from '../Fields';
import { validateRegistrationData } from '../../../redux/modules/users';
import SubmitButton from '../SubmitButton';

const RegistrationForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  instances,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.registrationForm.title' defaultMessage='Create ReCodEx account' />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <SubmitButton
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id='app.registrationForm.createAccount' defaultMessage='Create account' />,
            submitting: <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.registrationForm.processing' defaultMessage='Creating account ...' /></span>,
            success: <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.registrationForm.success' defaultMessage='Your account has been created.' /></span>
          }} />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.registrationForm.failed' defaultMessage='Registration failed. Please check your information.' />
      </Alert>)}

    <Field name='firstName' required component={TextField} label={<FormattedMessage id='app.registrationForm.firstName' defaultMessage='First name:' />} />
    <Field name='lastName' required component={TextField} label={<FormattedMessage id='app.registrationForm.lastName' defaultMessage='Last name:' />} />
    <Field name='email' required component={EmailField} label={<FormattedMessage id='app.registrationForm.email' defaultMessage='E-mail address:' />} />
    <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.registrationForm.password' defaultMessage='Password:' />} />
    <Field name='passwordStrength' component={PasswordStrength} label={<FormattedMessage id='app.registrationForm.passwordStrength' defaultMessage='Password strength:' />} />
    <Field
      name='instanceId'
      required
      component={SelectField}
      label={<FormattedMessage id='app.registrationForm.instance' defaultMessage='Instance:' />}
      options={instances.map(
        instance => ({ key: instance.getIn(['data', 'id']), name: instance.getIn(['data', 'name']) })
      ).toArray()} />
  </FormBox>
);

RegistrationForm.propTypes = {
  instances: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  istTryingToCreateAccount: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
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

const asyncValidate = ({ email = '', password = '' }, dispatch) =>
  dispatch(validateRegistrationData(email, password))
    .then(res => res.value)
    .then(({ usernameIsFree, passwordScore }) => {
      var errors = {};
      if (usernameIsFree === false) {
        errors['email'] = <FormattedMessage id='app.registrationForm.validation.emailAlreadyTaken' defaultMessage='This email address is already taken by another user.' />;
      }

      if (passwordScore <= 0) {
        errors['password'] = <FormattedMessage id='app.registrationForm.validation.passwordTooWeak' defaultMessage='The password you chose is too weak, please choose a different one.' />;
      }
      dispatch(change('registration', 'passwordStrength', passwordScore));

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
