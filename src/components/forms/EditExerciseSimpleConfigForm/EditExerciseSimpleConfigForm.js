import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import { getSupplementaryFilesForExercise } from '../../../redux/selectors/supplementaryFiles';
import { SUBMIT_BUTTON_MESSAGES } from '../../../helpers/exercise/config';
import { ENV_JAVA_ID, ENV_DATA_ONLY_ID, ENV_PROLOG_ID } from '../../../helpers/exercise/environments';
import {
  exerciseConfigFormSmartFillAll,
  exerciseConfigFormSmartFillInput,
  exerciseConfigFormSmartFillArgs,
  exerciseConfigFormSmartFillOutput,
  exerciseConfigFormSmartFillJudge,
  exerciseConfigFormSmartFillCompilation,
  exerciseConfigFormSmartFillExtraFiles,
} from '../../../redux/modules/exerciseConfigs';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs';
import { encodeNumId, createIndex, safeSet, safeGet } from '../../../helpers/common';

const supplementaryFilesOptions = defaultMemoize((files, locale) =>
  files
    .sort((a, b) => a.name.localeCompare(b.name, locale))
    .filter((item, pos, arr) => arr.indexOf(item) === pos) // WTF?
    .map(data => ({
      key: data.name,
      name: data.name,
    }))
);

class EditExerciseSimpleConfigForm extends Component {
  render() {
    const {
      reset,
      change,
      handleSubmit,
      submitting,
      submitFailed,
      submitSucceeded,
      invalid,
      dirty,
      formValues,
      formErrors,
      supplementaryFiles,
      environmentsWithEntryPoints,
      exercise,
      exerciseTests,
      smartFill,
      intl: { locale },
    } = this.props;

    const dataOnly = Boolean(exercise.runtimeEnvironments.find(env => env.id === ENV_DATA_ONLY_ID));
    const prologOnly = Boolean(exercise.runtimeEnvironments.find(env => env.id === ENV_PROLOG_ID));

    return (
      <div>
        {dataOnly && (
          <div className="callout callout-info">
            <p>
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.isDataOnly"
                defaultMessage="The exercise is configured as data-only. It means there is no compilation, the student submits only data, and the data are verified using custom judge. The time and memory limits are applied on the judge itself."
              />
            </p>
          </div>
        )}

        {prologOnly && (
          <div className="callout callout-info">
            <p>
              <FormattedMessage
                id="app.editExerciseSimpleConfigForm.isPrologOnly"
                defaultMessage="The exercise is configured for Prolog. Prolog uses specialized setup as the solutions are resolved by a wrapper script. Input file holds a Prolog query in text format. The output holds enumeration of all possible answers, each answer on a separate line. The answers are sorted in ascending lexicographical order to avoid ambiguity."
              />
            </p>
          </div>
        )}

        <FormBox
          title={<FormattedMessage id="app.editExercise.editConfig" defaultMessage="Edit Exercise Configuration" />}
          unlimitedHeight
          noPadding
          success={submitSucceeded}
          dirty={dirty}
          footer={
            <div className="text-center">
              {dirty && (
                <span>
                  <Button type="reset" onClick={reset} bsStyle="danger">
                    <RefreshIcon gapRight />
                    <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                  </Button>
                </span>
              )}

              <SubmitButton
                id="editExerciseSimpleConfig"
                invalid={invalid}
                submitting={submitting}
                dirty={dirty}
                hasSucceeded={submitSucceeded}
                hasFailed={submitFailed}
                handleSubmit={handleSubmit}
                messages={SUBMIT_BUTTON_MESSAGES}
              />
            </div>
          }>
          {submitFailed && (
            <Alert bsStyle="danger">
              <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
            </Alert>
          )}
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...files) => (
              <div>
                {exerciseTests
                  .sort((a, b) => a.name.localeCompare(b.name, locale))
                  .map((test, idx) => {
                    const testData = formValues && formValues.config && formValues.config[encodeNumId(test.id)];
                    return (
                      <EditExerciseSimpleConfigTest
                        change={change}
                        environmentsWithEntryPoints={environmentsWithEntryPoints}
                        exercise={exercise}
                        extraFiles={testData && testData['extra-files']}
                        jarFiles={testData && testData['jar-files']}
                        key={idx}
                        smartFill={
                          idx === 0 && exerciseTests.length > 1 ? smartFill(test.id, exerciseTests, files) : undefined
                        }
                        supplementaryFiles={supplementaryFilesOptions(files, locale)}
                        test={'config.' + encodeNumId(test.id)}
                        testErrors={formErrors && formErrors[encodeNumId(test.id)]}
                        testName={test.name}
                        useCustomJudge={testData && testData.useCustomJudge}
                        useOutFile={testData && testData.useOutFile}
                      />
                    );
                  })}
              </div>
            )}
          </ResourceRenderer>
        </FormBox>
      </div>
    );
  }
}

EditExerciseSimpleConfigForm.propTypes = {
  initialValues: PropTypes.object,
  reset: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
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
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  smartFill: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const validate = (formData, { exercise }) => {
  const errors = {};

  for (const testKey in formData.config) {
    const test = formData.config[testKey];
    // Check the input file names for duplicities
    if (test['input-files'] && test['input-files'].length > 1) {
      const nameIndex = createIndex(test['input-files'].map(({ name }) => name && name.trim()).filter(name => name));

      // Traverse the index and place an error to all duplicates ...
      for (const name in nameIndex) {
        const indices = nameIndex[name];
        if (indices.length > 1) {
          indices.forEach(idx =>
            safeSet(
              errors,
              ['config', testKey, 'input-files', idx, 'name'],
              <FormattedMessage
                id="app.editExerciseConfigForm.validation.duplicateFileName"
                defaultMessage="Duplicate name detected."
              />
            )
          );
        }
      }
    }

    // Check the names of extra files for duplicites ...
    for (const envId in test['extra-files']) {
      const extraFiles = test['extra-files'][envId];
      if (extraFiles && extraFiles.length > 1) {
        const nameIndex = createIndex(extraFiles.map(({ name }) => name && name.trim()).filter(name => name));

        // Traverse the index and place an error to all duplicates ...
        for (const name in nameIndex) {
          const indices = nameIndex[name];
          if (indices.length > 1) {
            indices.forEach(idx => {
              safeSet(
                errors,
                ['config', testKey, 'extra-files', envId, idx, 'name'],
                <FormattedMessage
                  id="app.editExerciseConfigForm.validation.duplicateFileName"
                  defaultMessage="Duplicate name detected."
                />
              );
            });
          }
        }
      }
    }

    // Special test for Java JAR files only !!!
    const jarFiles = safeGet(test, ['jar-files', ENV_JAVA_ID]);
    if (jarFiles) {
      jarFiles.forEach(
        (file, idx) =>
          file.trim() === '' &&
          safeSet(
            errors,
            ['config', testKey, 'jar-files', ENV_JAVA_ID, idx],
            <FormattedMessage
              id="app.editExerciseConfigForm.validation.noFileSelected"
              defaultMessage="Please select a file."
            />
          )
      );
    }

    if (jarFiles && jarFiles.length > 1) {
      const nameIndex = createIndex(jarFiles.map(name => name && name.trim()).filter(name => name));

      // Traverse the index and place an error to all duplicates ...
      for (const name in nameIndex) {
        const indices = nameIndex[name];
        if (indices.length > 1) {
          indices.forEach(idx => {
            safeSet(
              errors,
              ['config', testKey, 'jar-files', ENV_JAVA_ID, idx],
              <FormattedMessage
                id="app.editExerciseConfigForm.validation.duplicateFile"
                defaultMessage="Duplicate file detected."
              />
            );
          });
        }
      }
    }

    // Special case -- Prolog only
    if (exercise.runtimeEnvironments.find(env => env.id === ENV_PROLOG_ID)) {
      if (!test['stdin-file']) {
        safeSet(
          errors,
          ['config', testKey, 'stdin-file'],
          <FormattedMessage
            id="app.editExerciseConfigForm.validation.stdinFileEmpty"
            defaultMessage="Please, fill in the std. input file."
          />
        );
      }
    }
  }

  return errors;
};

const FORM_NAME = 'editExerciseSimpleConfig';

const warnEntryPointStateFunction = (current, next) =>
  current === undefined ? next : next === current ? current : 'ambiguous';

const warn = formData => {
  const envEntryPointDefaults = {};
  for (const testKey in formData.config) {
    const test = formData.config[testKey];
    for (const envId in test['entry-point']) {
      const entryPoint = test['entry-point'][envId];
      envEntryPointDefaults[envId] = warnEntryPointStateFunction(envEntryPointDefaults[envId], entryPoint === '');
    }
  }

  const warnings = {};
  for (const envId in envEntryPointDefaults) {
    if (envEntryPointDefaults[envId] === 'ambiguous') {
      for (const testKey in formData.config) {
        safeSet(
          warnings,
          ['config', testKey, 'entry-point', envId],
          <FormattedMessage
            id="app.editExerciseConfigForm.validation.ambiguousEntryPoint"
            defaultMessage="Some entry points of this environment are specified whilst some are left to be specified by the student. This may be quite ambiguous."
          />
        );
      }
    }
  }

  return warnings;
};

export default connect(
  (state, { exercise }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(exercise.id)(state),
      formValues: getFormValues(FORM_NAME)(state),
      formErrors: exerciseConfigFormErrors(state, FORM_NAME),
    };
  },
  dispatch => ({
    smartFill: (testId, tests, files) => ({
      all: () => dispatch(exerciseConfigFormSmartFillAll(FORM_NAME, testId, tests, files)),
      input: () => dispatch(exerciseConfigFormSmartFillInput(FORM_NAME, testId, tests, files)),
      args: () => dispatch(exerciseConfigFormSmartFillArgs(FORM_NAME, testId, tests, files)),
      output: () => dispatch(exerciseConfigFormSmartFillOutput(FORM_NAME, testId, tests, files)),
      judge: () => dispatch(exerciseConfigFormSmartFillJudge(FORM_NAME, testId, tests, files)),
      compilation: () => dispatch(exerciseConfigFormSmartFillCompilation(FORM_NAME, testId, tests, files)),
      extraFiles: () => dispatch(exerciseConfigFormSmartFillExtraFiles(FORM_NAME, testId, tests, files)),
    }),
  })
)(
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    immutableProps: ['formValues', 'supplementaryFiles', 'exerciseTests', 'handleSubmit'],
    validate,
    warn,
  })(injectIntl(EditExerciseSimpleConfigForm))
);
