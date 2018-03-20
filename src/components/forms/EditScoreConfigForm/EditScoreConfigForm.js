import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import { SourceCodeField } from '../Fields';
import SubmitButton from '../SubmitButton';

const EditScoreConfigForm = ({
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed,
  submitSucceeded,
  invalid
}) =>
  <div>
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="generic.savingFailed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}

    <Field
      name="scoreConfig"
      component={SourceCodeField}
      mode="yaml"
      label={
        <FormattedMessage
          id="app.editScoreConfigForm.scoreConfig"
          defaultMessage="Score configuration:"
        />
      }
    />

    <div className="text-center">
      <SubmitButton
        id="editEnvironmentConfig"
        invalid={invalid}
        submitting={submitting}
        hasSucceeded={submitSucceeded}
        dirty={anyTouched}
        hasFailed={submitFailed}
        handleSubmit={handleSubmit}
        messages={{
          submit: (
            <FormattedMessage
              id="app.editScoreConfigForm.submit"
              defaultMessage="Change configuration"
            />
          ),
          submitting: (
            <FormattedMessage
              id="app.editScoreConfigForm.submitting"
              defaultMessage="Saving configuration ..."
            />
          ),
          success: (
            <FormattedMessage
              id="app.editScoreConfigForm.success"
              defaultMessage="Configuration was changed."
            />
          )
        }}
      />
    </div>
  </div>;

EditScoreConfigForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = () => {
  const errors = {};
  return errors;
};

export default reduxForm({
  form: 'editScoreConfig',
  validate
})(EditScoreConfigForm);
