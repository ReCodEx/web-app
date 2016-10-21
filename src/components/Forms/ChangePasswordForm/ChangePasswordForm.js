import React, { PropTypes } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import { SuccessIcon, LoadingIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { EmailField, TextField, PasswordField, PasswordStrength, SelectField } from '../Fields';
import { validatePasswordStrength } from '../../../redux/modules/auth';

const ChangePasswordForm = ({
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.changePasswordForm.title' defaultMessage='Change your ReCodEx password' />}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <Button
          type='submit'
          onClick={handleSubmit}
          bsStyle='success'
          className='btn-flat'
          disabled={invalid || submitting || hasSucceeded}>
          {!submitting
            ? hasSucceeded
              ? <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.changePasswordForm.success' defaultMessage='Your password has been changed.' /></span>
              : <FormattedMessage id='app.changePasswordForm.changePassword' defaultMessage='Change password' />
            : <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.changePasswordForm.processing' defaultMessage='Changing password ...' /></span>}
        </Button>
      </div>
    }>
    {hasSucceeded && (
      <Alert bsStyle='success'>
        <FormattedMessage id='app.changePasswordForm.succeeded' defaultMessage='You can now log in with your new password.' />
      </Alert>
    )}

    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.changePasswordForm.failed' defaultMessage='Changing password failed.' />
      </Alert>)}

    <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.changePasswordForm.password' defaultMessage='New password:' />} />
    <Field name='passwordCheck' component={PasswordField} label={<FormattedMessage id='app.changePasswordForm.passwordCheck' defaultMessage='Repeat your password to prevent typos:' />} />
    <Field name='passwordStrength' component={PasswordStrength} label={<FormattedMessage id='app.changePasswordForm.passwordStrength' defaultMessage='Password strength:' />} />
  </FormBox>
);

ChangePasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool
};

const validate = ({ password, passwordCheck }) => {
  const errors = {};
  if (!password) {
    errors['password'] = <FormattedMessage id='app.changePasswordForm.validation.emptyPassword' defaultMessage='Password cannot be empty.' />;
  }

  if (!passwordCheck || passwordCheck !== password) {
    errors['passwordCheck'] = <FormattedMessage id='app.changePasswordForm.validation.passwordsDontMatch' defaultMessage="Passwords don't match." />;
  }

  return errors;
};

const asyncValidate = ({ password = '' }, dispatch) =>
  dispatch(validatePasswordStrength(password))
    .then(res => res.value)
    .then(({ passwordScore }) => {
      var errors = {};
      if (passwordScore <= 0) {
        errors['password'] = <FormattedMessage id='app.changePasswordForm.validation.passwordTooWeak' defaultMessage='The password you chose is too weak, please choose a different one.' />;
      }
      dispatch(change('changePassword', 'passwordStrength', passwordScore));

      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    });

export default reduxForm({
  form: 'changePassword',
  validate,
  asyncValidate,
  asyncBlurFields: [ 'password' ]
})(ChangePasswordForm);
