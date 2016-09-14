import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isEmail from 'validator/lib/isEmail';

import { SuccessIcon, LoadingIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { EmailField, PasswordField } from '../Fields';

import {
  Button,
  Alert
} from 'react-bootstrap';

const LoginForm = ({
  invalid,
  handleSubmit,
  hasFailed,
  submitting,
  hasSucceeded = false
}) => (
  <FormBox
    title={<FormattedMessage id='app.loginForm.title' defaultMessage='Sign into ReCodEx' />}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <Button
          type='submit'
          bsStyle='success'
          className='btn-flat'
          onClick={handleSubmit}
          disabled={invalid || submitting || hasSucceeded}>
          {!submitting
            ? hasSucceeded
              ? <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.loginForm.success' defaultMessage='You are successfully signed in' /></span>
              : <FormattedMessage id='app.loginForm.login' defaultMessage='Sign in' />
            : <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.loginForm.processing' defaultMessage='Signing in ...' /></span>}
        </Button>
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.loginForm.failed' defaultMessage='Login failed. Please check your credentials.' />
      </Alert>)}

    <Field name='email' required component={EmailField} label={<FormattedMessage id='app.loginForm.email' defaultMessage='E-mail address:' />} />
    <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.loginForm.password' defaultMessage='Password:' />} />
  </FormBox>
);

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ email, password }) => {
  const errors = {};
  if (email && isEmail(email) === false) {
    errors['email'] = <FormattedMessage id='app.loginForm.validation.emailIsNotAnEmail' defaultMessage='E-mail address is not valid.' />;
  } else if (!email) {
    errors['email'] = <FormattedMessage id='app.loginForm.validation.emptyEmail' defaultMessage='E-mail address cannot be empty.' />;
  }

  if (!password) {
    errors['password'] = <FormattedMessage id='app.loginForm.validation.emptyPassword' defaultMessage='Password cannot be empty.' />;
  }

  return errors;
};

export default reduxForm({
  form: 'login',
  validate
})(LoginForm);
