import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert } from 'react-bootstrap';
import FormBox from '../../AdminLTE/FormBox';
import SubmitButton from '../SubmitButton';
import isEmail from 'validator/lib/isEmail';

import { TextField, EmailField, PasswordField } from '../Fields';

const EditUserProfileForm = ({
  submitting,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.editUserProfileForm.title' defaultMessage='Edit profile' />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <SubmitButton
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          tabIndex={9}
          messages={{
            submit: <FormattedMessage id='app.editUserProfileForm.set' defaultMessage='Save changes' />,
            submitting: <FormattedMessage id='app.editUserProfileForm.processing' defaultMessage='Saving ...' />,
            success: <FormattedMessage id='app.editUserProfileForm.success' defaultMessage='Profile settings has been saved.' />
          }} />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.editUserProfileForm.failed' defaultMessage="Cannot save profile settings." />
      </Alert>)}

      <Field
        name='name.firstName'
        tabIndex={1}
        component={TextField}
        required
        label={<FormattedMessage id='app.editUserProfile.firstName' defaultMessage='First name:' />} />

      <Field
        name='name.lastName'
        tabIndex={2}
        component={TextField}
        required
        label={<FormattedMessage id='app.editUserProfile.lastName' defaultMessage='Last name:' />} />

      <Field
        name='name.degreesBeforeName'
        tabIndex={3}
        component={TextField}
        required
        label={<FormattedMessage id='app.editUserProfile.degreesBeforeName' defaultMessage='Degrees before name:' />} />

      <Field
        name='name.degreesAfterName'
        tabIndex={4}
        component={TextField}
        required
        label={<FormattedMessage id='app.editUserProfile.degreesAfterName' defaultMessage='Degrees after name:' />} />

      <Field
        name='email'
        tabIndex={5}
        component={EmailField}
        required
        label={<FormattedMessage id='app.editUserProfile.email' defaultMessage='Email:' />} />

      <h3><FormattedMessage id='app.editUserProfile.passwordTitle' defaultMessage='Change your password' /></h3>
      <p><FormattedMessage id='app.editUserProfile.passwordInstructions' defaultMessage="If you don't want to change your password leave these inputs blank" /></p>

      <Field name='password' tabIndex={6} component={PasswordField} label={<FormattedMessage id='app.changePasswordForm.oldPassword' defaultMessage='Old password:' />} />
      <Field name='newPassword' tabIndex={7} component={PasswordField} label={<FormattedMessage id='app.changePasswordForm.password' defaultMessage='New password:' />} />
      <Field name='passwordCheck' tabIndex={8} component={PasswordField} label={<FormattedMessage id='app.changePasswordForm.passwordCheck' defaultMessage='Repeat your password to prevent typos:' />} />
      {/* <Field name='passwordStrength' component={PasswordStrength} label={<FormattedMessage id='app.changePasswordForm.passwordStrength' defaultMessage='Password strength:' />} /> */}

  </FormBox>
);

EditUserProfileForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  istTryingToCreateAccount: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ firstName, lastName, email, password, newPassword, passwordCheck }) => {
  const errors = {};

  if (!firstName || firstName.length === 0) {
    errors['firstName'] = <FormattedMessage id='app.editUserProfile.validation.emptyFirstName' defaultMessage='First name cannot be empty.' />;
  }

  if (!lastName || lastName.length === 0) {
    errors['lastName'] = <FormattedMessage id='app.editUserProfile.validation.emptyLastName' defaultMessage='Last name cannot be empty.' />;
  }

  if (email && email.length > 0 && !isEmail(email)) {
    errors['email'] = <FormattedMessage id='app.editUserProfile.validation.invalidEmail' defaultMessage='Email address is not valid.' />;
  }

  if (password || newPassword || passwordCheck) {
    if (!password || password.length === 0) {
      errors['password'] = <FormattedMessage id='app.editUserProfile.validation.emptyOldPassword' defaultMessage='Old password cannot be empty if you want to change your password.' />;
    }

    if (!newPassword || newPassword.length === 0) {
      errors['newPassword'] = <FormattedMessage id='app.editUserProfile.validation.emptyNewPassword' defaultMessage='New password cannot be empty if you want to change your password.' />;
    }

    if (newPassword !== passwordCheck) {
      errors['passwordCheck'] = <FormattedMessage id='app.editUserProfile.validation.passwordsDontMatch' defaultMessage="Passwords don't match." />;
    }
  }

  return errors;
};

export default reduxForm({
  form: 'edit-user-profile',
  validate
})(EditUserProfileForm);
