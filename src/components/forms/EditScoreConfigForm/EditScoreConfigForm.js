import React from 'react';
import PropTypes from 'prop-types';
import { canUseDOM } from 'exenv';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import { SourceCodeField } from '../Fields';
import SubmitButton from '../SubmitButton';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditScoreConfigForm = ({
  anyTouched,
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid
}) =>
  <div>
    {hasFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editScoreConfigForm.failed"
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
        hasSucceeded={hasSucceeded}
        dirty={anyTouched}
        hasFailed={hasFailed}
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
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
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
