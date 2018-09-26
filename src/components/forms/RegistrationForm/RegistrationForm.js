import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import { eventAggregator } from '../../../helpers/eventAggregator';
import FormBox from '../../widgets/FormBox';
import {
  EmailField,
  TextField,
  PasswordField,
  PasswordStrength,
  SelectField
} from '../Fields';
import { validateRegistrationData } from '../../../redux/modules/users';
import SubmitButton from '../SubmitButton';

const RegistrationForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidate,
  anyTouched,
  instances,
  asyncValidating,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.registrationForm.title"
        defaultMessage="Create ReCodEx account"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="registration"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          dirty={anyTouched}
          asyncValidating={asyncValidating}
          invalid={invalid || instances.length === 0}
          messages={{
            submit: (
              <FormattedMessage
                id="app.registrationForm.createAccount"
                defaultMessage="Create account"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.registrationForm.processing"
                defaultMessage="Creating account ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.registrationForm.success"
                defaultMessage="Your account has been created."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.registrationForm.failed"
          defaultMessage="Registration failed. Please check your information."
        />
      </Alert>}

    <Field
      name="firstName"
      component={TextField}
      label={
        <FormattedMessage
          id="app.registrationForm.firstName"
          defaultMessage="First name:"
        />
      }
    />
    <Field
      name="lastName"
      component={TextField}
      label={
        <FormattedMessage
          id="app.registrationForm.lastName"
          defaultMessage="Last name:"
        />
      }
    />
    <Field
      name="email"
      component={EmailField}
      label={
        <FormattedMessage
          id="app.registrationForm.email"
          defaultMessage="E-mail address:"
        />
      }
    />

    <Field
      name="password"
      component={PasswordField}
      onKeyDown={() =>
        eventAggregator('RegistrationFormAsyncValidate', asyncValidate, 500)}
      label={
        <FormattedMessage
          id="app.registrationForm.password"
          defaultMessage="Password:"
        />
      }
    />

    <Field
      name="passwordStrength"
      component={PasswordStrength}
      label={
        <FormattedMessage
          id="app.registrationForm.passwordStrength"
          defaultMessage="Password strength:"
        />
      }
    />

    <Field
      name="passwordConfirm"
      component={PasswordField}
      label={
        <FormattedMessage
          id="app.registrationForm.passwordConfirm"
          defaultMessage="Confirm password:"
        />
      }
    />

    <Field
      name="instanceId"
      required
      component={SelectField}
      label={
        <FormattedMessage
          id="app.externalRegistrationForm.instance"
          defaultMessage="Instance:"
        />
      }
      addEmptyOption
      options={instances.map(({ id: key, name }) => ({ key, name }))}
    />
  </FormBox>;

RegistrationForm.propTypes = {
  instances: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  asyncValidate: PropTypes.func.isRequired,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
    .isRequired,
  invalid: PropTypes.bool
};

const validate = ({
  firstName,
  lastName,
  email,
  password,
  passwordConfirm,
  instanceId
}) => {
  const errors = {};

  if (!firstName) {
    errors['firstName'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emptyFirstName"
        defaultMessage="First name cannot be empty."
      />
    );
  }

  if (firstName && firstName.length < 2) {
    errors['firstName'] = (
      <FormattedMessage
        id="app.registrationForm.validation.shortFirstName"
        defaultMessage="First name must contain at least 2 characters."
      />
    );
  }

  if (!lastName) {
    errors['lastName'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emptyLastName"
        defaultMessage="Last name cannot be empty."
      />
    );
  }

  if (lastName && lastName.length < 2) {
    errors['lastName'] = (
      <FormattedMessage
        id="app.registrationForm.validation.shortLastName"
        defaultMessage="Last name must contain at least 2 characters."
      />
    );
  }

  if (!email) {
    errors['email'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emptyEmail"
        defaultMessage="E-mail address cannot be empty."
      />
    );
  } else if (!isEmail(email)) {
    errors['email'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emailIsNotAnEmail"
        defaultMessage="E-mail address is not valid."
      />
    );
  }

  if (!password) {
    errors['password'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emptyPassword"
        defaultMessage="Password cannot be empty."
      />
    );
  }

  if (!passwordConfirm) {
    errors['passwordConfirm'] = (
      <FormattedMessage
        id="app.registrationForm.validation.emptyPassword"
        defaultMessage="Password cannot be empty."
      />
    );
  }

  if (password !== passwordConfirm) {
    errors['passwordConfirm'] = (
      <FormattedMessage
        id="app.registrationForm.validation.passwordDontMatch"
        defaultMessage="Passwords don't match."
      />
    );
  }

  if (!instanceId) {
    errors['instanceId'] = (
      <FormattedMessage
        id="app.externalRegistrationForm.validation.instanceId"
        defaultMessage="Please select one of the instances."
      />
    );
  }

  return errors;
};

const asyncValidate = ({ email = '', password = '' }, dispatch) =>
  new Promise((resolve, reject) =>
    dispatch(validateRegistrationData(email, password))
      .then(res => res.value)
      .then(({ usernameIsFree, passwordScore }) => {
        var errors = {};
        if (usernameIsFree === false) {
          errors['email'] = (
            <FormattedMessage
              id="app.registrationForm.validation.emailAlreadyTaken"
              defaultMessage="This email address is already taken by another user."
            />
          );
        }

        dispatch(change('registration', 'passwordStrength', passwordScore));

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );

export default reduxForm({
  form: 'registration',
  validate,
  asyncValidate,
  asyncBlurFields: ['email', 'password', 'passwordConfirm']
})(RegistrationForm);
