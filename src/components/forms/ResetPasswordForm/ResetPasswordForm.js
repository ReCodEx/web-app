import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isEmail from 'validator/lib/isEmail.js';

import Button from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { SuccessIcon, LoadingIcon } from '../../icons';
import FormBox from '../../widgets/FormBox';
import { EmailField } from '../Fields';

const ResetPasswordForm = ({ submitting, handleSubmit, hasFailed = false, hasSucceeded = false, invalid }) => (
  <FormBox
    title={<FormattedMessage id="app.resetPassword.title" defaultMessage="Reset Password" />}
    type={hasSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <Button type="submit" onClick={handleSubmit} variant="success" disabled={invalid || submitting || hasSucceeded}>
          {!submitting ? (
            hasSucceeded ? (
              <span>
                <SuccessIcon gapRight={2} />
                <FormattedMessage id="app.resetPassword.success" defaultMessage="Processing was finished." />
              </span>
            ) : (
              <FormattedMessage id="app.resetPassword.resetPassword" defaultMessage="Reset password" />
            )
          ) : (
            <span>
              <LoadingIcon gapRight={2} />
              <FormattedMessage id="app.resetPassword.processing" defaultMessage="Resetting your password..." />
            </span>
          )}
        </Button>
      </div>
    }>
    {hasFailed && (
      <Callout variant="danger">
        <FormattedMessage
          id="app.resetPassword.failed"
          defaultMessage="Resetting password failed. Please check your email address."
        />
      </Callout>
    )}

    {hasSucceeded && (
      <Callout variant="success">
        <FormattedMessage
          id="app.resetPassword.succeeded"
          defaultMessage="Resetting password succeeded. Please check your email for further instructions."
        />
      </Callout>
    )}

    <Field
      name="username"
      required
      component={EmailField}
      label={<FormattedMessage id="app.resetPassword.email" defaultMessage="E-mail address:" />}
    />
  </FormBox>
);

ResetPasswordForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
};

const validate = ({ username }) => {
  const errors = {};
  if (!username) {
    errors.username = (
      <FormattedMessage id="app.resetPassword.validation.emptyEmail" defaultMessage="E-mail address cannot be empty." />
    );
  } else if (!isEmail(username)) {
    errors.username = (
      <FormattedMessage
        id="app.resetPassword.validation.emailIsNotAnEmail"
        defaultMessage="E-mail address is not valid."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'resetPassword',
  validate,
})(ResetPasswordForm);
