import React, { PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { SuccessIcon, LoadingIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { TextField, PasswordField } from '../Fields';

import {
  Button,
  Alert
} from 'react-bootstrap';

const LoginCASForm = ({
  invalid,
  handleSubmit,
  submitFailed: hasFailed,
  submitting,
  hasSucceeded
}) => (
  <FormBox
    title={<FormattedMessage id='app.loginCASForm.title' defaultMessage='Sign into ReCodEx using CAS UK' />}
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
              ? <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.loginCASForm.success' defaultMessage='You are successfully signed in' /></span>
              : <FormattedMessage id='app.loginCASForm.login' defaultMessage='Sign in' />
            : <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.loginCASForm.processing' defaultMessage='Signing in ...' /></span>}
        </Button>
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.loginCASForm.failed' defaultMessage='Login failed. Please check your credentials.' />
      </Alert>)}

    <Field name='ukco' required component={TextField} label={<FormattedMessage id='app.loginCASForm.ukco' defaultMessage="UKCO (student's number):" />} />
    <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.loginCASForm.password' defaultMessage='Password:' />} />
  </FormBox>
);

LoginCASForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ ukco, password }) => {
  const errors = {};
  if (!ukco) {
    errors['ukco'] = <FormattedMessage id='app.loginCASForm.validation.emptyUKCO' defaultMessage='UKCO address cannot be empty.' />;
  }

  if (!password) {
    errors['password'] = <FormattedMessage id='app.loginCASForm.validation.emptyPassword' defaultMessage='Password cannot be empty.' />;
  }

  return errors;
};

export default reduxForm({
  form: 'login-cas',
  validate
})(LoginCASForm);
