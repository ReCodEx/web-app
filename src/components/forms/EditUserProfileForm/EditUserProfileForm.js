import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, change } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { Throttle } from 'react-throttle';
import { validateRegistrationData } from '../../../redux/modules/users';

import { TextField, PasswordField, PasswordStrength } from '../Fields';

const EditUserProfileForm = ({
  submitting,
  handleSubmit,
  anyTouched,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidate,
  pristine,
  asyncValidating,
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editUserProfileForm.title"
        defaultMessage="Edit profile"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editUserProfile"
          handleSubmit={handleSubmit}
          submitting={submitting}
          dirty={anyTouched}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          asyncValidating={asyncValidating}
          invalid={pristine || invalid}
          tabIndex={9}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editUserProfileForm.set"
                defaultMessage="Save changes"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editUserProfileForm.processing"
                defaultMessage="Saving ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editUserProfileForm.success"
                defaultMessage="Profile settings has been saved."
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
          id="app.editUserProfileForm.failed"
          defaultMessage="Cannot save profile settings."
        />
      </Alert>}

    <Field
      name="name.firstName"
      tabIndex={1}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.editUserProfile.firstName"
          defaultMessage="First name:"
        />
      }
    />

    <Field
      name="name.lastName"
      tabIndex={2}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.editUserProfile.lastName"
          defaultMessage="Last name:"
        />
      }
    />

    <Field
      name="name.degreesBeforeName"
      tabIndex={3}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.editUserProfile.degreesBeforeName"
          defaultMessage="Degrees before name:"
        />
      }
    />

    <Field
      name="name.degreesAfterName"
      tabIndex={4}
      component={TextField}
      required
      label={
        <FormattedMessage
          id="app.editUserProfile.degreesAfterName"
          defaultMessage="Degrees after name:"
        />
      }
    />

    <Field
      name="email"
      tabIndex={6}
      component={TextField}
      label={
        <FormattedMessage
          id="app.changePasswordForm.email"
          defaultMessage="Email:"
        />
      }
    />

    <h3>
      <FormattedMessage
        id="app.editUserProfile.passwordTitle"
        defaultMessage="Change your password"
      />
    </h3>
    <p>
      <FormattedMessage
        id="app.editUserProfile.passwordInstructions"
        defaultMessage="If you don't want to change your password leave these inputs blank"
      />
    </p>

    <Field
      name="password"
      tabIndex={6}
      component={PasswordField}
      label={
        <FormattedMessage
          id="app.changePasswordForm.oldPassword"
          defaultMessage="Old password:"
        />
      }
    />

    <Throttle time={500} handler="onKeyDown">
      <Field
        name="newPassword"
        component={PasswordField}
        tabIndex={7}
        onKeyDown={() => asyncValidate()}
        label={
          <FormattedMessage
            id="app.changePasswordForm.password"
            defaultMessage="New password:"
          />
        }
      />
    </Throttle>

    <Field
      name="passwordCheck"
      tabIndex={8}
      component={PasswordField}
      label={
        <FormattedMessage
          id="app.changePasswordForm.passwordCheck"
          defaultMessage="Repeat your password to prevent typos:"
        />
      }
    />
    <Field
      name="passwordStrength"
      component={PasswordStrength}
      label={
        <FormattedMessage
          id="app.changePasswordForm.passwordStrength"
          defaultMessage="Password strength:"
        />
      }
    />

  </FormBox>;

EditUserProfileForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  asyncValidate: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  pristine: PropTypes.bool
};

const validate = ({
  firstName,
  lastName,
  email,
  password,
  newPassword,
  passwordCheck
}) => {
  const errors = {};

  if (!firstName || firstName.length === 0) {
    errors['firstName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyFirstName"
        defaultMessage="First name cannot be empty."
      />
    );
  }

  if (!lastName || lastName.length === 0) {
    errors['lastName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyLastName"
        defaultMessage="Last name cannot be empty."
      />
    );
  }

  if (password || newPassword || passwordCheck) {
    if (!password || password.length === 0) {
      errors['password'] = (
        <FormattedMessage
          id="app.editUserProfile.validation.emptyOldPassword"
          defaultMessage="Old password cannot be empty if you want to change your password."
        />
      );
    }

    if (!newPassword || newPassword.length === 0) {
      errors['newPassword'] = (
        <FormattedMessage
          id="app.editUserProfile.validation.emptyNewPassword"
          defaultMessage="New password cannot be empty if you want to change your password."
        />
      );
    }

    if (newPassword !== passwordCheck) {
      errors['passwordCheck'] = (
        <FormattedMessage
          id="app.editUserProfile.validation.passwordsDontMatch"
          defaultMessage="Passwords don't match."
        />
      );
    }

    if (newPassword && newPassword.length > 0 && newPassword === password) {
      errors['newPassword'] = (
        <FormattedMessage
          id="app.editUserProfile.validation.samePasswords"
          defaultMessage="Changing your password to the same password does not make any sense."
        />
      );
    }
  }

  return errors;
};

const asyncValidate = ({ email, newPassword = '' }, dispatch) =>
  dispatch(validateRegistrationData(email, newPassword))
    .then(res => res.value)
    .then(({ usernameIsFree, passwordScore }) => {
      var errors = {};
      if (!usernameIsFree) {
        errors['email'] = (
          <FormattedMessage
            id="app.editUserProfile.validation.emailTaken"
            defaultMessage="This email address is already taken by someone else or it is equal to your old email address."
          />
        );
      }

      if (newPassword.lenght > 0 && passwordScore <= 0) {
        // changing new password is optional
        errors['newPassword'] = (
          <FormattedMessage
            id="app.editUserProfile.validation.passwordTooWeak"
            defaultMessage="The password you chose is too weak, please choose a different one."
          />
        );
        dispatch(
          change('edit-user-profile', 'passwordStrength', passwordScore)
        );
      }

      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    });

export default reduxForm({
  form: 'edit-user-profile',
  validate,
  asyncValidate,
  asyncBlurFields: ['email', 'newPassword']
})(EditUserProfileForm);
