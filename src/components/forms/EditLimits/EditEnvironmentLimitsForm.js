import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';

import { LimitsField } from '../Fields';
import SubmitButton from '../SubmitButton';

const EditEnvironmentLimitsForm = ({
  tests,
  onSubmit,
  anyTouched,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid,
  asyncValidating,
  ...props
}) =>
  <div>
    {tests.map(test =>
      <LimitsField
        key={test}
        prefix={`limits.${test}`}
        test={test}
        label={test}
      />
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
              values={{ env: name }}
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
  tests: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default reduxForm({
  form: 'editLimits'
})(EditEnvironmentLimitsForm);
