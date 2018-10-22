import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { Map } from 'immutable';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import { TextField, PasswordField, SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';

const ExternalRegistrationForm = ({
  submitting,
  handleSubmit,
  submitSucceeded,
  submitFailed,
  anyTouched,
  instances = Map(),
  invalid
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.externalRegistrationForm.title"
        defaultMessage="Create ReCodEx account using CAS"
      />
    }
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className="text-center">
        <SubmitButton
          id="externalRegistrationForm"
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          dirty={anyTouched}
          invalid={invalid || instances.size === 0}
          messages={{
            submit: (
              <FormattedMessage
                id="app.registrationForm.createAccount"
                defaultMessage="Create account"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.registrationForm.processing"
                defaultMessage="Creating account..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.registrationForm.success"
                defaultMessage="Your account has been created."
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
          id="app.externalRegistrationForm.failed"
          defaultMessage="Registration failed. Please check your information."
        />
      </Alert>}

    <Field
      name="username"
      required
      component={TextField}
      label={
        <FormattedMessage
          id="app.externalRegistrationForm.username"
          defaultMessage="CAS login (UKČO):"
        />
      }
    />
    <Field
      name="password"
      required
      component={PasswordField}
      label={
        <FormattedMessage
          id="app.externalRegistrationForm.password"
          defaultMessage="Password:"
        />
      }
    />

    <Field
      name="instanceId"
      required
      component={SelectField}
      label={
        <FormattedMessage
          id="app.externalRegistrationForm.instance"
          defaultMessage="Instance:"
        />
      }
      addEmptyOption
      options={instances.map(({ id: key, name }) => ({ key, name }))}
    />
  </FormBox>;

ExternalRegistrationForm.propTypes = {
  instances: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ username, password, instanceId }) => {
  const errors = {};

  if (!username) {
    errors['username'] = (
      <FormattedMessage
        id="app.externalRegistrationForm.validation.emptyUsername"
        defaultMessage="Username cannot be empty."
      />
    );
  }

  if (!password) {
    errors['password'] = (
      <FormattedMessage
        id="app.externalRegistrationForm.validation.emptyPassword"
        defaultMessage="Password cannot be empty."
      />
    );
  }

  if (!instanceId) {
    errors['instanceId'] = (
      <FormattedMessage
        id="app.externalRegistrationForm.validation.instanceId"
        defaultMessage="Please select one of the instances."
      />
    );
  }

  return errors;
};

const initialValues = {
  serviceId: 'cas-uk'
};

export default reduxForm({
  form: 'external-registration',
  initialValues,
  validate,
  asyncBlurFields: ['password']
})(ExternalRegistrationForm);
