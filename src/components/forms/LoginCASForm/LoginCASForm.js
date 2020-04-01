import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { SuccessIcon, LoadingIcon } from '../../icons';
import FormBox from '../../widgets/FormBox';
import { TextField, PasswordField } from '../Fields';

import { Alert } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';

const LoginCASForm = ({ invalid, handleSubmit, submitFailed: hasFailed, submitting, hasSucceeded }) => (
  <FormBox
    title={<FormattedMessage id="app.loginCASForm.title" defaultMessage="Sign into ReCoVid using CAS UK" />}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <Button type="submit" bsStyle="success" onClick={handleSubmit} disabled={invalid || submitting || hasSucceeded}>
          {!submitting ? (
            hasSucceeded ? (
              <span>
                <SuccessIcon gapRight />
                <FormattedMessage id="app.loginCASForm.success" defaultMessage="You are successfully signed in" />
              </span>
            ) : (
              <FormattedMessage id="app.loginCASForm.login" defaultMessage="Sign in" />
            )
          ) : (
            <span>
              <LoadingIcon gapRight />
              <FormattedMessage id="app.loginCASForm.processing" defaultMessage="Signing in..." />
            </span>
          )}
        </Button>
      </div>
    }>
    {hasFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage id="app.loginCASForm.failed" defaultMessage="Login failed. Please check your credentials." />
      </Alert>
    )}

    <Field
      name="ukco"
      required
      component={TextField}
      maxLength={64}
      label={<FormattedMessage id="app.loginCASForm.ukco" defaultMessage="UKCO (student's number):" />}
    />
    <Field
      name="password"
      required
      component={PasswordField}
      label={<FormattedMessage id="app.loginCASForm.password" defaultMessage="Password:" />}
    />
  </FormBox>
);

LoginCASForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
};

const validate = ({ ukco, password }) => {
  const errors = {};
  if (!ukco) {
    errors.ukco = (
      <FormattedMessage id="app.loginCASForm.validation.emptyUKCO" defaultMessage="UKCO address cannot be empty." />
    );
  }

  if (!password) {
    errors.password = (
      <FormattedMessage id="app.loginCASForm.validation.emptyPassword" defaultMessage="Password cannot be empty." />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'login-cas',
  validate,
})(LoginCASForm);
