import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, change } from 'redux-form';
import { Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import SubmitButton from '../SubmitButton';
import { validateRegistrationData } from '../../../redux/modules/users';
import { TextField, PasswordField, PasswordStrength } from '../Fields';

const CreateUserForm = ({
  submitting,
  handleSubmit,
  onSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidating,
  invalid,
  reset,
}) => (
  <div>
    <Field
      name="firstName"
      component={TextField}
      maxLength={100}
      required
      ignoreDirty
      label={<FormattedMessage id="app.editUserProfile.firstName" defaultMessage="Given Name:" />}
    />

    <Field
      name="lastName"
      component={TextField}
      maxLength={255}
      required
      ignoreDirty
      label={<FormattedMessage id="app.editUserProfile.lastName" defaultMessage="Surname:" />}
    />

    <Field
      name="email"
      component={TextField}
      autoComplete="off"
      maxLength={255}
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.email" defaultMessage="Email:" />}
    />

    <Field
      name="password"
      component={PasswordField}
      autoComplete="off"
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.password" defaultMessage="New Password:" />}
    />

    <Field
      name="passwordStrength"
      component={PasswordStrength}
      label={<FormattedMessage id="app.changePasswordForm.passwordStrength" defaultMessage="Password Strength:" />}
    />

    <Field
      name="passwordConfirm"
      component={PasswordField}
      ignoreDirty
      label={<FormattedMessage id="app.changePasswordForm.passwordCheck" defaultMessage="New Password (again):" />}
    />

    {submitFailed && (
      <Alert variant="danger">
        <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
      </Alert>
    )}

    <div className="text-center">
      <SubmitButton
        id="createUser"
        handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
        submitting={submitting}
        dirty={dirty}
        invalid={invalid}
        hasSucceeded={submitSucceeded}
        hasFailed={submitFailed}
        asyncValidating={asyncValidating}
        messages={{
          submit: <FormattedMessage id="generic.create" defaultMessage="Create" />,
          submitting: <FormattedMessage id="generic.creating" defaultMessage="Creating..." />,
          success: <FormattedMessage id="generic.created" defaultMessage="Created" />,
        }}
      />
    </div>
  </div>
);

CreateUserForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  asyncValidate: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  reset: PropTypes.func,
};

const validate = ({ firstName, lastName, email, password, passwordConfirm }) => {
  const errors = {};

  if (!firstName) {
    errors.firstName = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyFirstName"
        defaultMessage="First name cannot be empty."
      />
    );
  }

  if (firstName && firstName.length < 2) {
    errors.firstName = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortFirstName"
        defaultMessage="First name must contain at least 2 characters."
      />
    );
  }

  if (!lastName) {
    errors.lastName = (
      <FormattedMessage id="app.editUserProfile.validation.emptyLastName" defaultMessage="Last name cannot be empty." />
    );
  }

  if (lastName && lastName.length < 2) {
    errors.lastName = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortLastName"
        defaultMessage="Last name must contain at least 2 characters."
      />
    );
  }

  if (email && isEmail(email) === false) {
    errors.email = (
      <FormattedMessage
        id="app.editUserProfile.validation.emailNotValid"
        defaultMessage="E-mail address is not valid."
      />
    );
  } else if (!email) {
    errors.email = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyEmail"
        defaultMessage="E-mail address cannot be empty."
      />
    );
  }

  if (!password) {
    errors.password = (
      <FormattedMessage
        id="app.createUserForm.validation.emptyPassword"
        defaultMessage="The password cannot be empty."
      />
    );
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = (
      <FormattedMessage
        id="app.createUserForm.validation.emptyPassword"
        defaultMessage="The password cannot be empty."
      />
    );
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = (
      <FormattedMessage
        id="app.editUserProfile.validation.passwordsDontMatch"
        defaultMessage="Passwords do not match."
      />
    );
  }

  return errors;
};

const asyncValidate = ({ email, password = '' }, dispatch) => {
  if (password === '') {
    dispatch(change('edit-user-profile', 'passwordStrength', null));
    return Promise.resolve();
  }

  return new Promise((resolve, reject) =>
    dispatch(validateRegistrationData(email, password))
      .then(res => res.value)
      .then(({ usernameIsFree, passwordScore }) => {
        const errors = {};
        if (!usernameIsFree) {
          errors.email = (
            <FormattedMessage
              id="app.createUserForm.validation.emailTaken"
              defaultMessage="This email address is already taken by someone else."
            />
          );
        }

        dispatch(change('edit-user-profile', 'passwordStrength', passwordScore));

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      })
      .then(resolve())
      .catch(errors => reject(errors))
  );
};

export default reduxForm({
  form: 'edit-user-profile',
  validate,
  asyncValidate,
  asyncBlurFields: ['email', 'password', 'passwordConfirm'],
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(CreateUserForm);
