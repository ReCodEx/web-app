import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import FormBox from '../../widgets/FormBox';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { createGetSupplementaryFiles } from '../../../redux/selectors/supplementaryFiles';

import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';

const EditExerciseSimpleConfigForm = ({
  reset,
  handleSubmit,
  submitting,
  submitFailed,
  submitSucceeded,
  invalid,
  dirty,
  formValues,
  supplementaryFiles,
  exerciseTests
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
          {exerciseTests.map((test, i) =>
            <EditExerciseSimpleConfigTest
              key={i}
              formValues={formValues}
              supplementaryFiles={files}
              testName={test.name}
              test={`config.${i}`}
              i={i}
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
  supplementaryFiles: ImmutablePropTypes.map,
  exerciseTests: PropTypes.array
};

const validate = ({ config }) => {
  const errors = {};

  const configErrors = {};
  for (let i = 0; i < config.length; ++i) {
    const test = config[i];
    const testErrors = {};

    if (!test.expectedOutput || test.expectedOutput === '') {
      testErrors['expectedOutput'] = (
        <FormattedMessage
          id="app.editExerciseSimpleConfigForm.validation.expectedOutput"
          defaultMessage="Please fill the expected output file."
        />
      );
    }

    if (test.useOutFile && (!test.outputFile || test.outputFile === '')) {
      testErrors['outputFile'] = (
        <FormattedMessage
          id="app.editExerciseSimpleConfigForm.validation.outputFile"
          defaultMessage="Please fill the name of the output file or use standard input instead."
        />
      );
    }

    if (!test.judgeBinary || test.judgeBinary === '') {
      testErrors['judgeBinary'] = (
        <FormattedMessage
          id="app.editExerciseSimpleConfigForm.validation.judgeBinary"
          defaultMessage="Please select the judge type for this test."
        />
      );
    }

    if (
      test.useCustomJudge &&
      (!test.customJudgeBinary || test.customJudgeBinary === '')
    ) {
      testErrors['customJudgeBinary'] = (
        <FormattedMessage
          id="app.editExerciseSimpleConfigForm.validation.customJudge"
          defaultMessage="Please select the custom judge binary for this test or use one of the standard judges instead."
        />
      );
    }

    const inputErrorMessage = (
      <FormattedMessage
        id="app.editExerciseSimpleConfigForm.validation.inputFilesNotPaired"
        defaultMessage="Input files are not properly paired with their names. Please make sure each file has a name."
      />
    );
    const inFilesArr =
      test.inputFiles && Array.isArray(test.inputFiles) ? test.inputFiles : [];
    for (const inputFilePair of inFilesArr) {
      if (
        (!inputFilePair.first || inputFilePair.first === '') &&
        inputFilePair.second !== ''
      ) {
        testErrors['inputFiles'] = inputErrorMessage;
      }
      if (
        (!inputFilePair.second || inputFilePair.second === '') &&
        inputFilePair.first !== ''
      ) {
        testErrors['inputFiles'] = inputErrorMessage;
      }
    }

    configErrors[i] = testErrors;
  }
  errors['config'] = configErrors;

  return errors;
};

export default connect((state, { exercise }) => {
  const getSupplementaryFilesForExercise = createGetSupplementaryFiles(
    exercise.supplementaryFilesIds
  );
  return {
    supplementaryFiles: getSupplementaryFilesForExercise(state),
    formValues: getFormValues('editExerciseSimpleConfig')(state)
  };
})(
  reduxForm({
    form: 'editExerciseSimpleConfig',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    immutableProps: [
      'formValues',
      'supplementaryFiles',
      'exerciseTests',
      'handleSubmit'
    ],
    validate
  })(EditExerciseSimpleConfigForm)
);
