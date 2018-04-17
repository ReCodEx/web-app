import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Alert } from 'react-bootstrap';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import { getSupplementaryFilesForExercise } from '../../../redux/selectors/supplementaryFiles';
import { encodeNumId, createIndex } from '../../../helpers/common';
import { smartFillExerciseConfigForm } from '../../../redux/modules/exerciseConfigs';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs';

const hasCompilationExtraFiles = testData =>
  testData &&
  testData.compilation &&
  Object.keys(testData.compilation).reduce(
    (res, envId) =>
      res || testData.compilation[envId]['extra-files'].length > 0,
    false
  );

class EditExerciseSimpleConfigForm extends Component {
  render() {
    const {
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
      environmetnsWithEntryPoints,
      exercise,
      exerciseTests,
      smartFill,
      intl: { locale }
    } = this.props;

    return (
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
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
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
                    id="generic.validating"
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
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}
        <ResourceRenderer resource={supplementaryFiles.toArray()}>
          {(...files) =>
            <div>
              {exerciseTests
                .sort((a, b) => a.name.localeCompare(b.name, locale))
                .map((test, idx) => {
                  const testData =
                    formValues &&
                    formValues.config &&
                    formValues.config[encodeNumId(test.id)];
                  return (
                    <EditExerciseSimpleConfigTest
                      key={idx}
                      exercise={exercise}
                      hasCompilationExtraFiles={hasCompilationExtraFiles(
                        testData
                      )}
                      useOutFile={testData && testData.useOutFile}
                      useCustomJudge={testData && testData.useCustomJudge}
                      compilationParams={testData && testData.compilation}
                      environmetnsWithEntryPoints={environmetnsWithEntryPoints}
                      supplementaryFiles={files}
                      testName={test.name}
                      test={'config.' + encodeNumId(test.id)}
                      testErrors={
                        formErrors && formErrors[encodeNumId(test.id)]
                      }
                      smartFill={
                        idx === 0
                          ? smartFill(test.id, exerciseTests, files)
                          : undefined
                      }
                    />
                  );
                })}
            </div>}
        </ResourceRenderer>
      </FormBox>
    );
  }
}

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
  exercise: PropTypes.object,
  exerciseTests: PropTypes.array,
  environmetnsWithEntryPoints: PropTypes.array.isRequired,
  smartFill: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const FORM_NAME = 'editExerciseSimpleConfig';

const validate = formData => {
  const testErrors = {};

  for (const testKey in formData.config) {
    const test = formData.config[testKey];
    // Check the input file names for duplicities
    if (test.inputFiles && test.inputFiles.length > 1) {
      const nameIndex = createIndex(
        test.inputFiles
          .map(({ name }) => name && name.trim())
          .filter(name => name)
      );

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
                    id="app.editExerciseConfigForm.validation.duplicateFileName"
                    defaultMessage="Duplicate name detected."
                  />
                )
              })
          );
        }
      }
    }

    // Check the names of extra files for duplicites ...
    const compilationErrors = {};
    for (const envId in test.compilation) {
      const extraFiles = test.compilation[envId]['extra-files'];
      if (extraFiles && extraFiles.length > 1) {
        const nameIndex = createIndex(
          extraFiles.map(({ name }) => name && name.trim()).filter(name => name)
        );

        // Traverse the index and place an error to all duplicates ...
        const fileErrors = [];
        for (const name in nameIndex) {
          const indices = nameIndex[name];
          if (indices.length > 1) {
            indices.forEach(
              idx =>
                (fileErrors[idx] = {
                  name: (
                    <FormattedMessage
                      id="app.editExerciseConfigForm.validation.duplicateFileName"
                      defaultMessage="Duplicate name detected."
                    />
                  )
                })
            );
          }
        }

        if (Object.keys(fileErrors).length > 0) {
          compilationErrors[envId] = { 'extra-files': fileErrors };
        }
      }
    }

    if (Object.keys(compilationErrors).length > 0) {
      if (!testErrors[testKey]) {
        testErrors[testKey] = { compilation: compilationErrors };
      } else {
        testErrors[testKey].compilation = compilationErrors;
      }
    }
  }
  return Object.keys(testErrors).length > 0 ? { config: testErrors } : {};
};

const warnEntryPointStateFunction = (current, next) =>
  current === undefined ? next : next === current ? current : 'ambiguous';

const warn = formData => {
  const envEntryPointDefaults = {};
  for (const testKey in formData.config) {
    const test = formData.config[testKey];
    for (const envId in test.compilation) {
      const entryPoint = test.compilation[envId].entryPoint;
      envEntryPointDefaults[envId] = warnEntryPointStateFunction(
        envEntryPointDefaults[envId],
        entryPoint === ''
      );
    }
  }

  const warnings = {};
  for (const envId in envEntryPointDefaults) {
    if (envEntryPointDefaults[envId] === 'ambiguous') {
      for (const testKey in formData.config) {
        if (warnings[testKey] === undefined) {
          warnings[testKey] = { compilation: {} };
        }
        warnings[testKey].compilation[envId] = {
          entryPoint: (
            <FormattedMessage
              id="app.editExerciseConfigForm.validation.ambiguousEntryPoint"
              defaultMessage="Some entry points of this environment are specified whilst some are left to be specified by the student. This may be quite ambiguous."
            />
          )
        };
      }
    }
  }

  return Object.keys(warnings).length > 0 ? { config: warnings } : {};
};

export default connect(
  (state, { exercise, exerciseTests }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(exercise.id)(state),
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
    validate,
    warn
  })(injectIntl(EditExerciseSimpleConfigForm))
);
