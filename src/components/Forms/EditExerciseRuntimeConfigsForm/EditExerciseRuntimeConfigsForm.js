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
  runtimeConfigs,
  initialValues,
  submitting,
  anyTouched,
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
      runtimeConfigs={runtimeConfigs}
      component={EditRuntimeConfigForm} />

    <div className='text-center'>
      <SubmitButton
        id='editExerciseRuntimConfigs'
        invalid={invalid}
        submitting={submitting}
        dirty={anyTouched}
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
  runtimeConfigs: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  anyTouched: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ runtimeConfigs }) => {
  const errors = {};

  const runtimeConfigsErrors = {};
  for (let i = 0; i < runtimeConfigs.length; ++i) {
    const runtimeConfigErrors = {};

    if (!runtimeConfigs[i]) {
      runtimeConfigErrors['name'] = <FormattedMessage id='app.editExerciseRuntimeConfigsForm.validation.empty' defaultMessage='Please fill the runtime environment information.' />;
    } else {
      if (!runtimeConfigs[i].name || runtimeConfigs[i].name.length === 0) {
        runtimeConfigErrors['name'] = <FormattedMessage id='app.editExerciseRuntimeConfigsForm.validation.name' defaultMessage='Please fill the display name of the runtime environment.' />;
      }

      if (!runtimeConfigs[i].runtimeEnvironmentId || runtimeConfigs[i].runtimeEnvironmentId.length === 0) {
        runtimeConfigErrors['runtimeEnvironmentId'] = <FormattedMessage id='app.editExerciseRuntimeConfigsForm.validation.runtimeEnvironmentId' defaultMessage='Please select a runtime environment.' />;
      }

      if (!runtimeConfigs[i].jobConfig || runtimeConfigs[i].jobConfig.length === 0) {
        runtimeConfigErrors['jobConfig'] = <FormattedMessage id='app.editExerciseRuntimeConfigsForm.validation.jobConfig' defaultMessage='Please fill the job configuration of the runtime environment.' />;
      }

      runtimeConfigsErrors[i] = runtimeConfigErrors;
    }
  }
  errors['runtimeConfigs'] = runtimeConfigsErrors;

  return errors;
};

export default reduxForm({
  form: 'editExerciseRuntimeConfigs',
  validate
})(EditExerciseRuntimeConfigsForm);
