import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';

import { LimitsField } from '../Fields';
import SubmitButton from '../SubmitButton';

const EditEnvironmentLimitsForm = ({
  config,
  envName,
  onSubmit,
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid,
  asyncValidating,
  setHorizontally,
  setVertically,
  setAll,
  ...props
}) =>
  <div>
    {config.tests.map(test =>
      <div key={test.name}>
        <h4>
          {test.name}
        </h4>
        <LimitsField
          prefix={`limits.${test.name}`}
          label={test}
          id={`${envName}/${test.name}`}
          setHorizontally={setHorizontally(test.name)}
          setVertically={setVertically(test.name)}
          setAll={setAll(test.name)}
        />
        <hr />
      </div>
    )}

    <p className="text-center">
      <SubmitButton
        id="editExercise"
        invalid={invalid}
        submitting={submitting}
        dirty={anyTouched}
        hasSucceeded={hasSucceeded}
        hasFailed={hasFailed}
        handleSubmit={handleSubmit}
        asyncValidating={asyncValidating}
        messages={{
          submit: (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.submit"
              defaultMessage="Save changes to {env}"
              values={{ env: envName }}
            />
          ),
          submitting: (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.submitting"
              defaultMessage="Saving changes ..."
            />
          ),
          success: (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.success"
              defaultMessage="Saved."
            />
          ),
          validating: (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.validating"
              defaultMessage="Validating..."
            />
          )
        }}
      />
    </p>
  </div>;

EditEnvironmentLimitsForm.propTypes = {
  config: PropTypes.object.isRequired,
  envName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  setVertically: PropTypes.func.isRequired,
  setHorizontally: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired
};

const validate = ({ limits }) => {
  const errors = {};

  for (let test of Object.keys(limits)) {
    const testErrors = {};
    const fields = limits[test];

    if (!fields['memory'] || fields['memory'].length === 0) {
      testErrors['memory'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.memory"
          defaultMessage="You must set the memory limit."
        />
      );
    } else if (
      Number(fields['memory']).toString() !== fields['memory'] ||
      Number(fields['memory']) <= 0
    ) {
      testErrors['memory'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.memory.mustBePositive"
          defaultMessage="You must set the memory limit to a positive number."
        />
      );
    }

    if (!fields['time'] || fields['time'].length === 0) {
      testErrors['time'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.time"
          defaultMessage="You must set the time limit."
        />
      );
    } else if (
      Number(fields['time']).toString() !== fields['time'] ||
      Number(fields['time']) <= 0
    ) {
      testErrors['time'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.time.mustBePositive"
          defaultMessage="You must set the time limit to a positive number."
        />
      );
    }

    if (!fields['parallel'] || fields['parallel'].length === 0) {
      testErrors['parallel'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.parallel"
          defaultMessage="You must set the limit for the number of parallel processes."
        />
      );
    } else if (
      Number(fields['parallel']).toString() !== fields['parallel'] ||
      Number(fields['parallel']) <= 0
    ) {
      testErrors['parallel'] = (
        <FormattedMessage
          id="app.editEnvironmentLimitsForm.validation.parallel.mustBePositive"
          defaultMessage="You must set the limit for the number of parallel processes to a positive number."
        />
      );
    }

    if (testErrors.length > 0) {
      errors[test] = testErrors;
    }
  }

  return errors;
};

export default reduxForm({
  form: 'editLimits',
  validate
})(EditEnvironmentLimitsForm);
