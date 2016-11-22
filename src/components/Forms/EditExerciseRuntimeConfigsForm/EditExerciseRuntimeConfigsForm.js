import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditRuntimeConfigForm from '../EditRuntimeConfigForm';
import SubmitButton from '../SubmitButton';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditExerciseRuntimeConfigsForm = ({
  runtimeEnvironments,
  initialValues,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid
}) => (
  <div>
    {hasFailed && (
      <Alert bsStyle='danger'>
        <FormattedMessage id='app.editExerciseRuntimeConfigsForm.failed' defaultMessage='Saving failed. Please try again later.' />
      </Alert>)}

    <FieldArray
      name='runtimeConfigs'
      runtimeEnvironments={runtimeEnvironments}
      runtimeConfigs={initialValues.runtimeConfigs}
      component={EditRuntimeConfigForm} />

    <div className='text-center'>
      <SubmitButton
        invalid={invalid}
        submitting={submitting}
        hasSucceeded={hasSucceeded}
        hasFailed={hasFailed}
        handleSubmit={handleSubmit}
        messages={{
          submit: <FormattedMessage id='app.editExerciseRuntimeConfigsForm.submit' defaultMessage='Change runtime configurations' />,
          submitting: <FormattedMessage id='app.editExerciseRuntimeConfigsForm.submitting' defaultMessage='Saving runtime configurations ...' />,
          success: <FormattedMessage id='app.editExerciseRuntimeConfigsForm.success' defaultMessage='Runtime configurations were saved.' />
        }} />
    </div>
  </div>
);

EditExerciseRuntimeConfigsForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ runtimeConfigs }) => {
  const errors = {};

  // TODO: validation

  return errors;
};

export default reduxForm({
  form: 'editExerciseRuntimeConfigs',
  validate
})(EditExerciseRuntimeConfigsForm);
