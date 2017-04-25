import React, { PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isEmail from 'validator/lib/isEmail';

import { SuccessIcon, LoadingIcon } from '../../Icons';
import Icon from 'react-fontawesome';
import FormBox from '../../widgets/FormBox';
import { EmailField, PasswordField } from '../Fields';

import { Alert } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';

const LoginForm = (
  {
    invalid,
    handleSubmit,
    submitFailed: hasFailed,
    submitting,
    hasSucceeded
  }
) => (
  <FormBox
    title={
      <FormattedMessage
        id="app.loginForm.title"
        defaultMessage="Sign into ReCodEx"
      />
    }
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <Button
          type="submit"
          bsStyle="success"
          onClick={handleSubmit}
          disabled={invalid || submitting || hasSucceeded}
        >
          {!submitting
            ? hasSucceeded
                ? <span>
                    <SuccessIcon />
                    {' '}
                    <FormattedMessage
                      id="app.loginForm.success"
                      defaultMessage="You are successfully signed in"
                    />
                  </span>
                : <span>
                    <Icon name="sign-in" />
                    {' '}
                    <FormattedMessage
                      id="app.loginForm.login"
                      defaultMessage="Sign in"
                    />
                  </span>
            : <span>
                <LoadingIcon />
                {' '}
                <FormattedMessage
                  id="app.loginForm.processing"
                  defaultMessage="Signing in ..."
                />
              </span>}
        </Button>
      </div>
    }
  >
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.loginForm.failed"
          defaultMessage="Login failed. Please check your credentials."
        />
      </Alert>}

    <Field
      name="email"
      required
      component={EmailField}
      label={
        <FormattedMessage
          id="app.loginForm.email"
          defaultMessage="E-mail address:"
        />
      }
    />
    <Field
      name="password"
      required
      component={PasswordField}
      label={
        <FormattedMessage
          id="app.loginForm.password"
          defaultMessage="Password:"
        />
      }
    />
  </FormBox>
);

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool,
  submitting: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  submitFailed: PropTypes.bool
};

const validate = ({ email, password }) => {
  const errors = {};
  if (email && isEmail(email) === false) {
    errors['email'] = (
      <FormattedMessage
        id="app.loginForm.validation.emailIsNotAnEmail"
        defaultMessage="E-mail address is not valid."
      />
    );
  } else if (!email) {
    errors['email'] = (
      <FormattedMessage
        id="app.loginForm.validation.emptyEmail"
        defaultMessage="E-mail address cannot be empty."
      />
    );
  }

  if (!password) {
    errors['password'] = (
      <FormattedMessage
        id="app.loginForm.validation.emptyPassword"
        defaultMessage="Password cannot be empty."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'login',
  validate
})(LoginForm);
