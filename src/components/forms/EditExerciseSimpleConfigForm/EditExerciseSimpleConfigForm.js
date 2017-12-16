import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import { createGetSupplementaryFiles } from '../../../redux/selectors/supplementaryFiles';
import { encodeTestId } from '../../../redux/modules/simpleLimits';
import { smartFillExerciseConfigForm } from '../../../redux/modules/exerciseConfigs';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs';

const EditExerciseSimpleConfigForm = ({
  reset,
  handleSubmit,
  submitting,
  submitFailed,
  submitSucceeded,
  invalid,
  dirty,
  formValues,
  formErrors,
  supplementaryFiles,
  exerciseTests,
  smartFill
}) =>
  <FormBox
    title={
      <FormattedMessage
        id="app.editExercise.editConfig"
        defaultMessage="Edit exercise configuration"
      />
    }
    unlimitedHeight
    noPadding
    success={submitSucceeded}
    dirty={dirty}
    footer={
      <div className="text-center">
        {dirty &&
          <span>
            <Button
              type="reset"
              onClick={reset}
              bsStyle={'danger'}
              className="btn-flat"
            >
              <RefreshIcon /> &nbsp;
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.reset"
                defaultMessage="Reset"
              />
            </Button>{' '}
          </span>}

        <SubmitButton
          id="editExerciseSimpleConfig"
          invalid={invalid}
          submitting={submitting}
          dirty={dirty}
          hasSucceeded={submitSucceeded}
          hasFailed={submitFailed}
          handleSubmit={handleSubmit}
          messages={{
            submit: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.submit"
                defaultMessage="Save Configuration"
              />
            ),
            submitting: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.submitting"
                defaultMessage="Saving Configuration ..."
              />
            ),
            success: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.success"
                defaultMessage="Configuration Saved."
              />
            ),
            validating: (
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.validating"
                defaultMessage="Validating ..."
              />
            )
          }}
        />
      </div>
    }
  >
    {submitFailed &&
      <Alert bsStyle="danger">
        <FormattedMessage
          id="app.editExerciseConfigForm.failed"
          defaultMessage="Saving failed. Please try again later."
        />
      </Alert>}
    <ResourceRenderer resource={supplementaryFiles.toArray()}>
      {(...files) =>
        <div>
          {exerciseTests.map((test, idx) =>
            <EditExerciseSimpleConfigTest
              key={idx}
              formValues={formValues}
              supplementaryFiles={files}
              testName={test.name}
              test={'config.' + encodeTestId(test.id)}
              testId={test.id}
              testKey={encodeTestId(test.id)}
              testIndex={idx}
              testErrors={formErrors && formErrors[encodeTestId(test.id)]}
              smartFill={smartFill(test.id, exerciseTests, files)}
            />
          )}
        </div>}
    </ResourceRenderer>
  </FormBox>;

EditExerciseSimpleConfigForm.propTypes = {
  initialValues: PropTypes.object,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.object,
  formErrors: PropTypes.object,
  supplementaryFiles: ImmutablePropTypes.map,
  exerciseTests: PropTypes.array,
  smartFill: PropTypes.func.isRequired
};

const FORM_NAME = 'editExerciseSimpleConfig';

const validate = formData => {
  const testErrors = {};

  for (const testKey in formData.config) {
    const test = formData.config[testKey];
    if (test.inputFiles && test.inputFiles.length > 1) {
      // Construct a name index to detect duplicates ...
      const nameIndex = {};
      test.inputFiles.forEach(({ name }, idx) => {
        name = name && name.trim();
        if (name) {
          if (nameIndex[name] === undefined) {
            nameIndex[name] = [idx];
          } else {
            nameIndex[name].push(idx);
          }
        }
      });

      // Traverse the index and place an error to all duplicates ...
      for (const name in nameIndex) {
        const indices = nameIndex[name];
        if (indices.length > 1) {
          if (!testErrors[testKey]) {
            testErrors[testKey] = { inputFiles: [] };
          }
          indices.forEach(
            idx =>
              (testErrors[testKey].inputFiles[idx] = {
                name: (
                  <FormattedMessage
                    id="app.editExerciseConfigForm.validation.duplicateInputFile"
                    defaultMessage="Duplicate name detected."
                  />
                )
              })
          );
        }
      }
    }
  }
  return Object.keys(testErrors).length > 0
    ? { config: testErrors }
    : undefined;
};

export default connect(
  (state, { exercise }) => {
    const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
      exercise.supplementaryFilesIds
    );
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(state),
      formValues: getFormValues(FORM_NAME)(state),
      formErrors: exerciseConfigFormErrors(state, FORM_NAME)
    };
  },
  dispatch => ({
    smartFill: (testId, tests, files) => () =>
      dispatch(smartFillExerciseConfigForm(FORM_NAME, testId, tests, files))
  })
)(
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    immutableProps: [
      'formValues',
      'supplementaryFiles',
      'exerciseTests',
      'handleSubmit'
    ],
    validate
  })(EditExerciseSimpleConfigForm)
);
