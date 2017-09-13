import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Label } from 'react-bootstrap';
import Icon from 'react-fontawesome';

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
  getBoxesWithLimits,
  ...props
}) =>
  <div>
    {config.tests.map(test =>
      <div key={test.name}>
        <h4>
          {test.name}
        </h4>
        {test.pipelines.length === 0
          ? <em>
              <Icon name="folder-open-o" />{' '}
              <FormattedMessage
                id="app.editEnvironmentLimitsForm.noPipelinesForTest"
                defaultMessage="There are no pipelines for this test to edit."
              />
            </em>
          : test.pipelines.map(pipeline =>
              <div key={pipeline.name}>
                <h5>
                  {pipeline.name} {' '}
                  <Label>
                    <FormattedMessage
                      id="app.editEnvironmentLimitsForm.pipeline"
                      defaultMessage="Pipeline"
                    />
                  </Label>
                </h5>

                {getBoxesWithLimits(pipeline.name).length === 0
                  ? <em>
                      <Icon name="folder-open-o" />{' '}
                      <FormattedMessage
                        id="app.editEnvironmentLimitsForm.noBoxesForPipeline"
                        defaultMessage="There are no boxes which need to set limits in this pipeline."
                      />
                    </em>
                  : getBoxesWithLimits(pipeline.name).map(box =>
                      <div key={box.name}>
                        <h6>
                          {box.name}{' '}
                          <Label>
                            <FormattedMessage
                              id="app.editEnvironmentLimitsForm.box"
                              defaultMessage="Box"
                            />
                          </Label>
                        </h6>
                        <LimitsField
                          prefix={`limits.${test.name}.${pipeline.name}.${box.name}`}
                          label={test}
                        />
                      </div>
                    )}
              </div>
            )}
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
  getBoxesWithLimits: PropTypes.func.isRequired,
  asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

const validate = ({ limits }) => {
  const errors = {};

  for (let test of Object.keys(limits)) {
    const testErrors = {};
    for (let pipeline of Object.keys(limits[test])) {
      const pipelineErrors = {};
      for (let box of Object.keys(limits[test][pipeline])) {
        const boxErrors = {};
        const fields = limits[test][pipeline][box];

        if (!fields['memory'] || fields['memory'].length === 0) {
          boxErrors['memory'] = (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.validation.memory"
              defaultMessage="You must set the memory limit."
            />
          );
        } else if (
          Number(fields['memory']).toString() !== fields['memory'] ||
          Number(fields['memory']) <= 0
        ) {
          boxErrors['memory'] = (
            <FormattedMessage
              id="app.editEnvironmentLimitsForm.validation.memory.mustBePositive"
              defaultMessage="You must set the memory limit to a positive number."
            />
          );
        }

        if (boxErrors.length > 0) {
          pipelineErrors[box] = boxErrors;
        }
      }

      if (pipelineErrors.length > 0) {
        testErrors[pipeline] = pipelineErrors;
      }
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
