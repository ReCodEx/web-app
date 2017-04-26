import React, { PropTypes } from 'react';
import { reduxForm, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditEnvironmentLimitsForm from '../EditEnvironmentLimitsForm';
import SubmitButton from '../SubmitButton';

const EditExerciseLimitsForm = ({
  exercise,
  runtimeEnvironments,
  initialValues,
  anyTouched,
  submitting,
  handleSubmit,
  hasFailed = false,
  hasSucceeded = false,
  invalid
}) => (
  <div>
    {hasFailed && (
      <Alert bsStyle="danger">
        <FormattedMessage id="app.editExerciseLimitsForm.failed" defaultMessage="Saving failed. Please try again later." />
      </Alert>)}

    <FieldArray
      name="environments"
      environments={initialValues.environments}
      runtimeEnvironments={runtimeEnvironments}
      component={EditEnvironmentLimitsForm} />

    <p className="text-center">
      <SubmitButton
        id="editExerciseLimits"
        invalid={invalid}
        submitting={submitting}
        hasSucceeded={hasSucceeded}
        dirty={anyTouched}
        hasFailed={hasFailed}
        handleSubmit={handleSubmit}
        messages={{
          submit: <FormattedMessage id="app.editExerciseLimitsForm.submit" defaultMessage="Change limits" />,
          submitting: <FormattedMessage id="app.editExerciseLimitsForm.submitting" defaultMessage="Saving limits ..." />,
          success: <FormattedMessage id="app.editExerciseLimitsForm.success" defaultMessage="Limits were saved." />
        }} />
    </p>
  </div>
);

EditExerciseLimitsForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  runtimeEnvironments: PropTypes.object.isRequired,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  exercise: PropTypes.object,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool
};

const validate = ({ environments }) => {
  // traverse through all the runtime environments
  const environmentsErrors = [];
  environments.forEach((env, i) => {
    const envErrors = { environment: {}, limits: [] };
    if (env.environment.name.length === 0) {
      envErrors.environment.name = <FormattedMessage id="app.editExerciseLimitsForm.validation.envName" defaultMessage="Please fill environment name." />;
    }

    // validate limits for all hardware groups
    env.limits.forEach((hwGroup, j) => {
      const hwGroupErrors = {};
      for (let testName of Object.keys(hwGroup.tests)) {
        const testErrors = {};
        for (let taskId of Object.keys(hwGroup.tests[testName])) {
          const taskErrors = {};
          let { time, memory } = hwGroup.tests[testName][taskId];

          if (time.toString().indexOf(',') >= 0) {
            // the czech and some other number systems use decimal comas in real numbers
            taskErrors.time = <FormattedMessage id="app.editExerciseLimitsForm.validation.useDotDecimalSeparator" defaultMessage="Please use a dot as a decimal separator instead of the comma." />;
          } else if (parseFloat(time) !== Number(time)) {
            taskErrors.time = <FormattedMessage id="app.editExerciseLimitsForm.validation.timeIsNotNumer" defaultMessage="Time limit must be a real number." />;
          } else if (Number(time) <= 0) {
            taskErrors.time = <FormattedMessage id="app.editExerciseLimitsForm.validation.timeLimit" defaultMessage="Time limit must be a positive real number." />;
          }

          if (parseInt(memory) !== Number(memory)) {
            taskErrors.memory = <FormattedMessage id="app.editExerciseLimitsForm.validation.memoryIsNotNumer" defaultMessage="Memory limit must be an integer." />;
          } else if (Number(memory) <= 0) {
            taskErrors.memory = <FormattedMessage id="app.editExerciseLimitsForm.validation.memoryLimit" defaultMessage="Memory limit must be a positive integer." />;
          }
          testErrors[taskId] = taskErrors;
        }
        hwGroupErrors[testName] = testErrors;
      }
      envErrors.limits[j] = { tests: hwGroupErrors };
    });
    environmentsErrors[i] = envErrors;
  });

  return { environments: environmentsErrors };
};

export default reduxForm({
  form: 'editExerciseLimits',
  validate
})(EditExerciseLimitsForm);
