import React, { PropTypes } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button, Alert } from 'react-bootstrap';
import isEmail from 'validator/lib/isEmail';

import { LoadingIcon } from '../../Icons';
import FormBox from '../../AdminLTE/FormBox';
import { TextField, PasswordField, SelectField } from '../Fields';
import { validateRegistrationData } from '../../../redux/modules/users';

const ExternalRegistrationForm = ({
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  instances,
  invalid
}) => (
  <FormBox
    title={<FormattedMessage id='app.externalRegistrationForm.title' defaultMessage='Create ReCodEx account using CAS' />}
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
              ? <span><Icon name='check' /> &nbsp; <FormattedMessage id='app.externalRegistrationForm.success' defaultMessage='Your account has been created.' /></span>
              : <FormattedMessage id='app.externalRegistrationForm.createAccount' defaultMessage='Create account' />
            : <span><LoadingIcon /> &nbsp; <FormattedMessage id='app.externalRegistrationForm.processing' defaultMessage='Creating account ...' /></span>}
        </Button>
      </div>
    }>
    {hasFailed && (
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
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool
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
