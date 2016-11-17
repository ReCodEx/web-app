import React, { PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import { LoadingIcon, SuccessIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { TextField, PasswordField, SelectField } from '../Fields';
import SubmitButton from '../SubmitButton';

const ExternalRegistrationForm = ({
  submitting,
  handleSubmit,
  submitSucceeded,
  submitFailed,
  instances,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.externalRegistrationForm.title' defaultMessage='Create ReCodEx account using CAS' />}
    type={submitSucceeded ? 'success' : undefined}
    footer={
      <div className='text-center'>
        <SubmitButton
          handleSubmit={handleSubmit}
          submitting={submitting}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          invalid={invalid}
          messages={{
            submit: <FormattedMessage id='app.registrationForm.createAccount' defaultMessage='Create account' />,
            submitting: <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.registrationForm.processing' defaultMessage='Creating account ...' /></span>,
            success: <span><SuccessIcon /> &nbsp; <FormattedMessage id='app.registrationForm.success' defaultMessage='Your account has been created.' /></span>
          }} />
      </div>
    }>
    {submitFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.externalRegistrationForm.failed' defaultMessage='Registration failed. Please check your information.' />
      </Alert>)}

    <Field name='username' required component={TextField} label={<FormattedMessage id='app.externalRegistrationForm.username' defaultMessage='CAS login (UKČO):' />} />
    <Field name='password' required component={PasswordField} label={<FormattedMessage id='app.externalRegistrationForm.password' defaultMessage='Password:' />} />
    <Field
      name='instanceId'
      required
      component={SelectField}
      label={<FormattedMessage id='app.externalRegistrationForm.instance' defaultMessage='Instance:' />}
      options={instances.map(
        instance => ({ key: instance.getIn(['data', 'id']), name: instance.getIn(['data', 'name']) })
      ).toArray()} />
  </FormBox>
);

ExternalRegistrationForm.propTypes = {
  instances: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  istTryingToCreateAccount: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ username, password }) => {
  const errors = {};

  if (!username) {
    errors['username'] = <FormattedMessage id='app.externalRegistrationForm.validation.emptyUsername' defaultMessage='Username cannot be empty.' />;
  }

  if (!password) {
    errors['password'] = <FormattedMessage id='app.externalRegistrationForm.validation.emptyPassword' defaultMessage='Password cannot be empty.' />;
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
  asyncBlurFields: [ 'password' ]
})(ExternalRegistrationForm);
