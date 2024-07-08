import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { lruMemoize } from 'reselect';

import FormBox from '../../widgets/FormBox';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import { RefreshIcon, SaveIcon } from '../../icons';
import SubmitButton from '../SubmitButton';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest.js';
import { SUBMIT_BUTTON_MESSAGES } from '../../../helpers/exercise/config.js';
import { ENV_JAVA_ID, ENV_DATA_ONLY_ID, ENV_PROLOG_ID, ENV_HASKELL_ID } from '../../../helpers/exercise/environments.js';
import {
  exerciseConfigFormSmartFillAll,
  exerciseConfigFormSmartFillInput,
  exerciseConfigFormSmartFillArgs,
  exerciseConfigFormSmartFillEntryPoint,
  exerciseConfigFormSmartFillOutput,
  exerciseConfigFormSmartFillJudge,
  exerciseConfigFormSmartFillCompilation,
  exerciseConfigFormSmartFillExtraFiles,
} from '../../../redux/modules/exerciseConfigs.js';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs.js';
import { encodeNumId, createIndex, safeSet, safeGet, deepReduce } from '../../../helpers/common.js';

const supplementaryFilesOptions = lruMemoize((files, locale) =>
  files
    .sort((a, b) => a.name.localeCompare(b.name, locale))
    .filter((item, pos, arr) => arr.indexOf(item) === pos) // WTF?
    .map(data => ({
      key: data.name,
      name: data.name,
    }))
);

const createFilesNamesIndex = lruMemoize(
  files => files && new Set(deepReduce(files, [null, 'name']).filter(name => name))
);

const someValuesHaveNozeroLength = (obj, ...keys) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  for (const key of keys) {
    if (key in obj) {
      for (const val of Object.values(obj[key])) {
        if (val && val.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Make sure file(s) in form data (specified by given path) exist.
 * If not, proper form error message(s) is/are filled.
 */
const validateFileExists = (data, errors, path, existingFiles) => {
  if (!existingFiles) {
    return; // safeguard if the suplementary files are not loaded yet
  }

  let target = safeGet(data, path);
  if (target) {
    if (typeof target === 'object') {
      // it is an object, we need to dig deeper
      if (Array.isArray(target)) {
        target.forEach((_, idx) => validateFileExists(data, errors, [...path, idx], existingFiles));
        return;
      } else {
        target = target.file;
        path = [...path, 'file'];
      }
    }

    if (target && typeof target === 'string' && !existingFiles.has(target)) {
      safeSet(
        errors,
        path,
        <FormattedMessage
          id="app.editExerciseConfigForm.validation.fileDoesNotExist"
          defaultMessage='File "{file}" was selected here, but no such file exists.'
          values={{ file: target }}
        />
      );
    }
  }
};

const validateFileEntryNotEmpty = (data, errors, path, emptyError) => {
  const name = safeGet(data, path);
  if (!name || name.trim() === '') {
    safeSet(errors, path, emptyError);
  }
};

const validateFileList = (data, errors, path, pairs, existingFiles, emptyError, duplicateError) => {
  const files = safeGet(data, path);
  if (!files || files.length === 0) {
    return;
  }

  // check empty names
  files.forEach((_, idx) => {
    if (pairs) {
      validateFileEntryNotEmpty(data, errors, [...path, idx, 'file'], emptyError);
      validateFileEntryNotEmpty(data, errors, [...path, idx, 'name'], emptyError);
    } else {
      validateFileEntryNotEmpty(data, errors, [...path, idx], emptyError);
    }
  });

  if (files.length > 1) {
    // check for duplicit names/entries
    const nameIndex = createIndex(
      files.map(entry => (pairs ? ((entry && entry.name) || '').trim() : (entry || '').trim())).filter(name => name)
    );

    for (const name in nameIndex) {
      const indices = nameIndex[name];
      if (indices.length > 1) {
        // add error to all indices on a list
        indices.forEach(idx => safeSet(errors, [...path, idx, ...(pairs ? ['name'] : [])], duplicateError));
      }
    }
  }

  // validate files existence
  files.forEach((_, idx) => {
    if (!safeGet(errors, [...path, idx])) {
      // only if there are no other errors
      validateFileExists(data, errors, [...path, idx], existingFiles);
    }
  });
};

class EditExerciseSimpleConfigForm extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.supplementaryFiles !== this.props.supplementaryFiles) {
      // enforce re-validation if supplementary files have changed
      this.props.change('_validationHack', Date.now());
    }
  }

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
      readOnly = false,
      intl: { locale },
    } = this.props;

    const dataOnly = Boolean(exercise.runtimeEnvironments.find(env => env.id === ENV_DATA_ONLY_ID));
    const prologOnly = Boolean(exercise.runtimeEnvironments.find(env => env.id === ENV_PROLOG_ID));
    const haskellOnly = Boolean(exercise.runtimeEnvironments.find(env => env.id === ENV_HASKELL_ID));

    return (
      <div>
        {dataOnly && (
          <Callout variant="info">
            <FormattedMessage
              id="app.editExerciseSimpleConfigForm.isDataOnly"
              defaultMessage="The exercise is configured as data-only. It means there is no compilation, the student submits only data, and the data are verified using custom judge. The time and memory limits are applied on the judge itself."
            />
          </Callout>
        )}

        {prologOnly && (
          <Callout variant="info">
            <FormattedMessage
              id="app.editExerciseSimpleConfigForm.isPrologOnly"
              defaultMessage="The exercise is configured for Prolog. Prolog uses specialized setup as the solutions are resolved by a wrapper script. Input file comprise Prolog queries in text format, each on a single line. The output holds the serialized answers, each answer on a corresponding line to the input query. The answer comprise of all possible satisfactions of the query, sorted in ascending lexicographical order to avoid ambiguity."
            />
          </Callout>
        )}

        {haskellOnly && (
          <Callout variant="info">
            <FormattedMessage
              id="app.editExerciseSimpleConfigForm.isHaskellOnly"
              defaultMessage="The exercise is configured for Haskell. Haskell tests require a name of the entry-point function which is invoked as the main function (without arguments). The result of the function call is serialized to stdout and default ReCodEx judge compares it with the expected output. For testing purposes, you may provide your own testing functions in extra files. Remember, that extra files have to employ modules for code separation (whilst the submitted solution should be in the Main module)."
            />
          </Callout>
        )}

        <FormBox
          id="exercise-config-form"
          title={<FormattedMessage id="app.editExercise.editConfig" defaultMessage="Exercise Configuration" />}
          unlimitedHeight
          noPadding
          success={submitSucceeded}
          dirty={dirty}
          footer={
            !readOnly ? (
              <div className="text-center">
                <TheButtonGroup>
                  {dirty && (
                    <Button type="reset" onClick={reset} variant="danger">
                      <RefreshIcon gapRight />
                      <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                    </Button>
                  )}

                  <SubmitButton
                    id="editExerciseSimpleConfig"
                    invalid={invalid}
                    submitting={submitting}
                    dirty={dirty}
                    hasSucceeded={submitSucceeded}
                    hasFailed={submitFailed}
                    handleSubmit={handleSubmit}
                    defaultIcon={<SaveIcon gapRight />}
                    messages={SUBMIT_BUTTON_MESSAGES}
                  />
                </TheButtonGroup>
              </div>
            ) : null
          }>
          <div>
            {submitFailed && (
              <Callout variant="danger">
                <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
              </Callout>
            )}

            {exerciseTests
              .sort((a, b) => a.name.localeCompare(b.name, locale))
              .map((test, idx) => {
                const testData = formValues && formValues.config && formValues.config[encodeNumId(test.id)];
                const hasCompilationSetting = someValuesHaveNozeroLength(
                  testData,
                  'extra-files',
                  'jar-files',
                  'compile-args'
                );
                return (
                  <EditExerciseSimpleConfigTest
                    change={change}
                    environmentsWithEntryPoints={environmentsWithEntryPoints}
                    exercise={exercise}
                    extraFiles={testData && testData['extra-files']}
                    compilationInitiallyOpened={hasCompilationSetting}
                    key={idx}
                    smartFill={
                      idx === 0 && exerciseTests.length > 1
                        ? smartFill(test.id, exerciseTests, supplementaryFiles)
                        : undefined
                    }
                    supplementaryFiles={supplementaryFilesOptions(supplementaryFiles, locale)}
                    test={'config.' + encodeNumId(test.id)}
                    testErrors={formErrors && formErrors[encodeNumId(test.id)]}
                    testName={test.name}
                    useCustomJudge={testData && testData.useCustomJudge}
                    useOutFile={testData && testData.useOutFile}
                    readOnly={readOnly}
                  />
                );
              })}
          </div>
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
  supplementaryFiles: PropTypes.array,
  exercise: PropTypes.object,
  exerciseTests: PropTypes.array,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  smartFill: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

const validate = (formData, { exercise, supplementaryFiles }) => {
  const errors = {};
  const existingFiles = createFilesNamesIndex(supplementaryFiles);

  for (const testKey in formData.config) {
    const test = formData.config[testKey];

    validateFileList(
      formData,
      errors,
      ['config', testKey, 'input-files'],
      true, // (file, name) pairs
      existingFiles,
      <FormattedMessage
        id="app.expandingInputFilesField.validateEmpty"
        defaultMessage="This value must not be empty."
      />,
      <FormattedMessage
        id="app.editExerciseConfigForm.validation.duplicateFileName"
        defaultMessage="Duplicate name detected."
      />
    );

    for (const envId in test['extra-files']) {
      validateFileList(
        formData,
        errors,
        ['config', testKey, 'extra-files', envId],
        true, // (file, name) pairs
        existingFiles,
        <FormattedMessage
          id="app.expandingInputFilesField.validateEmpty"
          defaultMessage="This value must not be empty."
        />,
        <FormattedMessage
          id="app.editExerciseConfigForm.validation.duplicateFileName"
          defaultMessage="Duplicate name detected."
        />
      );

      if (test['entry-point'] && test['entry-point'][envId]) {
        const extraFilesIndex = createFilesNamesIndex(test['extra-files'][envId]);
        validateFileExists(formData, errors, ['config', testKey, 'entry-point', envId], extraFilesIndex);
      }
    }

    // Special test for Java JAR files only !!!
    const jarFiles = safeGet(test, ['jar-files', ENV_JAVA_ID]);
    if (jarFiles) {
      validateFileList(
        formData,
        errors,
        ['config', testKey, 'jar-files', ENV_JAVA_ID],
        false, // simple list (only file names)
        existingFiles,
        <FormattedMessage
          id="app.editExerciseConfigForm.validation.noFileSelected"
          defaultMessage="Please select a file."
        />,
        <FormattedMessage
          id="app.editExerciseConfigForm.validation.duplicateFile"
          defaultMessage="Duplicate file detected."
        />
      );
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

    validateFileExists(formData, errors, ['config', testKey, 'stdin-file'], existingFiles);
    validateFileExists(formData, errors, ['config', testKey, 'input-files'], existingFiles);
    validateFileExists(formData, errors, ['config', testKey, 'expected-output'], existingFiles);
    validateFileExists(formData, errors, ['config', testKey, 'jar-files', ENV_JAVA_ID], existingFiles);
    if (test.useCustomJudge) {
      validateFileExists(formData, errors, ['config', testKey, 'custom-judge'], existingFiles);
    }
  }

  return errors;
};

const FORM_NAME = 'editExerciseSimpleConfig';

const warnEntryPointStateFunction = (current, next) =>
  current === undefined ? next : next === current ? current : 'ambiguous';

const warn = formData => {
  const warnings = {};
  const envEntryPointDefaults = {};

  for (const testKey in formData.config) {
    const test = formData.config[testKey];

    const argsFields = ['run-args']; // list of all active args fields to be checked
    if (test.useCustomJudge) {
      argsFields.push('judge-args');
    }

    // check all args fields for whitespace
    argsFields.forEach(
      args =>
        test[args] &&
        test[args].forEach((val, idx) => {
          if (val && val.match(/\s+/)) {
            safeSet(
              warnings,
              ['config', testKey, args, idx],
              <FormattedMessage
                id="app.editExerciseConfigForm.validation.whitespaceInArg"
                defaultMessage="Whitespace is not an argument separator."
              />
            );
          }
        })
    );

    // check ambiguity of entry points and mark them in envEntryPointDefaults
    for (const envId in test['entry-point'] || {}) {
      const entryPoint = test['entry-point'][envId];
      envEntryPointDefaults[envId] = warnEntryPointStateFunction(envEntryPointDefaults[envId], entryPoint === '');
    }
  }

  // add warnings for ambiguous entry points based on envEntryPointDefaults
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
  state => {
    return {
      formValues: getFormValues(FORM_NAME)(state),
      formErrors: exerciseConfigFormErrors(state, FORM_NAME),
    };
  },
  dispatch => ({
    smartFill: (testId, tests, files) => ({
      all: () => dispatch(exerciseConfigFormSmartFillAll(FORM_NAME, testId, tests, files)),
      input: () => dispatch(exerciseConfigFormSmartFillInput(FORM_NAME, testId, tests, files)),
      args: () => dispatch(exerciseConfigFormSmartFillArgs(FORM_NAME, testId, tests, files)),
      entryPoint: () => dispatch(exerciseConfigFormSmartFillEntryPoint(FORM_NAME, testId, tests, files)),
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
