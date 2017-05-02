import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, Field } from 'redux-form';
import { Map } from 'immutable';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import FormBox from '../../widgets/FormBox';
import { CASAuthenticationButtonField, SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';

const RegistrationCASOauth = (
  {
    submitting,
    handleSubmit,
    submitSucceeded,
    submitFailed,
    anyTouched,
    instances = Map(),
    invalid
  }
) => (
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
          id="casRegistrationButton"
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
                defaultMessage="Creating account ..."
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
      name="ticket"
      required
      component={CASAuthenticationButtonField}
      label={
        <FormattedMessage
          id="app.externalRegistrationForm.username"
          defaultMessage="CAS login (UKČO):"
        />
      }
    />

    <ResourceRenderer resource={instances.toArray()}>
      {(...instances) => (
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
          options={[
            { key: '', name: '...' },
            ...instances.map(({ id: key, name }) => ({ key, name }))
          ]}
        />
      )}
    </ResourceRenderer>
  </FormBox>
);

RegistrationCASOauth.propTypes = {
  instances: ImmutablePropTypes.map.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  anyTouched: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ ticket, instanceId }) => {
  const errors = {};

  if (!ticket) {
    errors['ticket'] = (
      <FormattedMessage
        id="app.externalRegistrationForm.validation.ticket"
        defaultMessage="You must verify your CAS credentials."
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
  serviceId: 'cas-uk',
  clientUrl: null
};

export default reduxForm({
  form: 'registration-cas-oauth',
  initialValues,
  validate
})(RegistrationCASOauth);
