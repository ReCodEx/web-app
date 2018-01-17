import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, change } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';

import { validateRegistrationData } from '../../../redux/modules/users';

import { TextField, PasswordField, PasswordStrength } from '../Fields';

const EditUserProfileForm = ({
  submitting,
  handleSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidate,
  pristine,
  asyncValidating,
  invalid,
  allowChangePassword,
  emptyLocalPassword,
  reset
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
          handleSubmit={data => handleSubmit(data).then(() => reset())}
          submitting={submitting}
          dirty={dirty}
          invalid={invalid}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          asyncValidating={asyncValidating}
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
      autoComplete="off"
      label={
        <FormattedMessage
          id="app.changePasswordForm.email"
          defaultMessage="Email:"
        />
      }
    />

    {allowChangePassword &&
      <div>
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

        {emptyLocalPassword
          ? <div className="callout callout-warning">
              <h4>
                <FormattedMessage
                  id="app.editUserProfile.emptyLocalPassword"
                  defaultMessage="Local account does not have a password"
                />
              </h4>
              <p>
                <FormattedMessage
                  id="app.editUserProfile.emptyLocalPasswordExplain"
                  defaultMessage="You may not sign in to ReCodEx using local account until you set the password."
                />
              </p>
            </div>
          : <Field
              name="oldPassword"
              tabIndex={6}
              component={PasswordField}
              autoComplete="off"
              label={
                <FormattedMessage
                  id="app.changePasswordForm.oldPassword"
                  defaultMessage="Old password:"
                />
              }
            />}

        <Field
          name="password"
          component={PasswordField}
          autoComplete="off"
          tabIndex={7}
          label={
            <FormattedMessage
              id="app.changePasswordForm.password"
              defaultMessage="New password:"
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

        <Field
          name="passwordConfirm"
          tabIndex={8}
          component={PasswordField}
          label={
            <FormattedMessage
              id="app.changePasswordForm.passwordCheck"
              defaultMessage="Repeat your password to prevent typos:"
            />
          }
        />
      </div>}
  </FormBox>;

EditUserProfileForm.propTypes = {
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
  allowChangePassword: PropTypes.bool.isRequired,
  emptyLocalPassword: PropTypes.bool.isRequired
};

const validate = (
  { firstName, lastName, email, oldPassword, password, passwordConfirm },
  { allowChangePassword }
) => {
  const errors = {};

  if (!firstName) {
    errors['firstName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyFirstName"
        defaultMessage="First name cannot be empty."
      />
    );
  }

  if (firstName && firstName.length < 2) {
    errors['firstName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortFirstName"
        defaultMessage="First name must contain at least 2 characters."
      />
    );
  }

  if (!lastName) {
    errors['lastName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.emptyLastName"
        defaultMessage="Last name cannot be empty."
      />
    );
  }

  if (lastName && lastName.length < 2) {
    errors['lastName'] = (
      <FormattedMessage
        id="app.editUserProfile.validation.shortLastName"
        defaultMessage="Last name must contain at least 2 characters."
      />
    );
  }

  if (allowChangePassword) {
    if (oldPassword || password || passwordConfirm) {
      if (!password || password.length === 0) {
        errors['password'] = (
          <FormattedMessage
            id="app.editUserProfile.validation.emptyNewPassword"
            defaultMessage="New password cannot be empty if you want to change your password."
          />
        );
      }

      if (password !== passwordConfirm) {
        errors['passwordConfirm'] = (
          <FormattedMessage
            id="app.editUserProfile.validation.passwordsDontMatch"
            defaultMessage="Passwords don't match."
          />
        );
      }

      if (
        password &&
        password.length > 0 &&
        oldPassword &&
        oldPassword.length > 0 &&
        password === oldPassword
      ) {
        errors['password'] = (
          <FormattedMessage
            id="app.editUserProfile.validation.samePasswords"
            defaultMessage="Changing your password to the same password does not make any sense."
          />
        );
      }
    }
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
        var errors = {};
        if (!usernameIsFree) {
          errors['email'] = (
            <FormattedMessage
              id="app.editUserProfile.validation.emailTaken"
              defaultMessage="This email address is already taken by someone else or it is equal to your old email address."
            />
          );
        }

        dispatch(
          change('edit-user-profile', 'passwordStrength', passwordScore)
        );

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
  asyncBlurFields: ['email', 'password', 'passwordConfirm']
})(EditUserProfileForm);
