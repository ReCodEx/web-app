import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, change } from 'redux-form';
import { Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import FormBox from '../../widgets/FormBox';
import SubmitButton from '../SubmitButton';
import { validateRegistrationData } from '../../../redux/modules/users';
import { TextField, PasswordField, PasswordStrength, CheckboxField } from '../Fields';

const EditUserProfileForm = ({
  submitting,
  handleSubmit,
  onSubmit,
  dirty,
  submitFailed = false,
  submitSucceeded = false,
  asyncValidating,
  invalid,
  allowChangePassword,
  emptyLocalPassword,
  canForceChangePassword,
  disabledNameChange,
  reset,
}) => (
  <FormBox
    title={<FormattedMessage id="app.editUserProfileForm.title" defaultMessage="Edit Profile" />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="editUserProfile"
          handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
          submitting={submitting}
          dirty={dirty}
          invalid={invalid}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          asyncValidating={asyncValidating}
          tabIndex={9}
          messages={{
            submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
            submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
            success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
          }}
        />
      </div>
    }>
    {submitFailed && (
      <Alert variant="danger">
        <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
      </Alert>
    )}

    <Field
      name="degreesBeforeName"
      component={TextField}
      maxLength={42}
      required
      label={<FormattedMessage id="app.editUserProfile.degreesBeforeName" defaultMessage="Prefix Title:" />}
    />

    <Field
      name="firstName"
      component={TextField}
      maxLength={100}
      required
      disabled={disabledNameChange}
      label={<FormattedMessage id="app.editUserProfile.firstName" defaultMessage="Given Name:" />}
    />

    <Field
      name="lastName"
      component={TextField}
      maxLength={255}
      required
      disabled={disabledNameChange}
      label={<FormattedMessage id="app.editUserProfile.lastName" defaultMessage="Surname:" />}
    />

    <Field
      name="degreesAfterName"
      component={TextField}
      maxLength={42}
      required
      label={<FormattedMessage id="app.editUserProfile.degreesAfterName" defaultMessage="Suffix Title:" />}
    />

    <Field
      name="email"
      component={TextField}
      autoComplete="off"
      maxLength={255}
      label={<FormattedMessage id="app.changePasswordForm.email" defaultMessage="Email:" />}
    />

    <Field
      name="gravatarUrlEnabled"
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editUserProfile.gravatarEnabled"
          defaultMessage="Use Gravatar service for own avatar."
        />
      }
    />

    {allowChangePassword && (
      <div>
        <h3>
          <FormattedMessage id="app.editUserProfile.passwordTitle" defaultMessage="Change your password" />
        </h3>
        <p className="text-muted">
          <FormattedMessage
            id="app.editUserProfile.passwordInstructions"
            defaultMessage="If you do not want to change your password leave these inputs blank."
          />
        </p>

        {emptyLocalPassword ? (
          <div className="callout callout-warning">
            <h4>
              <FormattedMessage
                id="app.editUserProfile.emptyLocalPassword"
                defaultMessage="Local account does not have a password."
              />
            </h4>
            <p>
              <FormattedMessage
                id="app.editUserProfile.emptyLocalPasswordExplain"
                defaultMessage="You may not sign in to ReCodEx using local account until you set the password."
              />
            </p>
          </div>
        ) : (
          !canForceChangePassword && (
            <Field
              name="oldPassword"
              component={PasswordField}
              autoComplete="off"
              label={<FormattedMessage id="app.changePasswordForm.oldPassword" defaultMessage="Old Password:" />}
            />
          )
        )}

        <Field
          name="password"
          component={PasswordField}
          autoComplete="off"
          label={<FormattedMessage id="app.changePasswordForm.password" defaultMessage="New Password:" />}
        />

        <Field
          name="passwordStrength"
          component={PasswordStrength}
          label={<FormattedMessage id="app.changePasswordForm.passwordStrength" defaultMessage="Password Strength:" />}
        />

        <Field
          name="passwordConfirm"
          tabIndex={8}
          component={PasswordField}
          label={<FormattedMessage id="app.changePasswordForm.passwordCheck" defaultMessage="New Password (again):" />}
        />
      </div>
    )}
  </FormBox>
);

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
  emptyLocalPassword: PropTypes.bool.isRequired,
  canForceChangePassword: PropTypes.bool.isRequired,
  disabledNameChange: PropTypes.bool,
};

const validate = (
  { firstName, lastName, email, oldPassword, password, passwordConfirm },
  { disabledNameChange, allowChangePassword, emptyLocalPassword, canForceChangePassword }
) => {
  const errors = {};

  if (!firstName && !disabledNameChange) {
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

  if (!lastName && !disabledNameChange) {
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

  if (allowChangePassword) {
    if (oldPassword || password || passwordConfirm) {
      if (!oldPassword && !emptyLocalPassword && !canForceChangePassword) {
        errors.oldPassword = (
          <FormattedMessage
            id="app.editUserProfile.validation.emptyOldPassword"
            defaultMessage="Current password has to be verified before it can be changed."
          />
        );
      }

      if (!password || password.length === 0) {
        errors.password = (
          <FormattedMessage
            id="app.editUserProfile.validation.emptyNewPassword"
            defaultMessage="New password cannot be empty if you want to change your password."
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

      if (password && password.length > 0 && oldPassword && oldPassword.length > 0 && password === oldPassword) {
        errors.password = (
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
          errors.email = (
            <FormattedMessage
              id="app.editUserProfile.validation.emailTaken"
              defaultMessage="This email address is already taken by someone else or it is equal to your old email address."
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
})(EditUserProfileForm);
