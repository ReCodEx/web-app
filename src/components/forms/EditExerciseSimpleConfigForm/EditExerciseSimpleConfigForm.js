import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

import EditExerciseSimpleConfigTest from './EditExerciseSimpleConfigTest';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import { createGetSupplementaryFiles } from '../../../redux/selectors/supplementaryFiles';

class EditExerciseSimpleConfigForm extends Component {
  render() {
    const {
      anyTouched,
      submitting,
      handleSubmit,
      hasFailed = false,
      hasSucceeded = false,
      invalid,
      formValues,
      supplementaryFiles,
      exerciseTests
    } = this.props;
    return (
      <div>
        {hasFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="app.editExerciseConfigForm.failed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}
        <ResourceRenderer resource={supplementaryFiles.toArray()}>
          {(...files) =>
            <FieldArray
              name="config"
              component={EditExerciseSimpleConfigTest}
              formValues={formValues}
              supplementaryFiles={files}
              prefix="config"
              exerciseTests={exerciseTests}
            />}
        </ResourceRenderer>

        <p className="text-center">
          <SubmitButton
            id="editExerciseSimpleConfig"
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            dirty={anyTouched}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.submit"
                  defaultMessage="Change configuration"
                />
              ),
              submitting: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.submitting"
                  defaultMessage="Saving configuration ..."
                />
              ),
              success: (
                <FormattedMessage
                  id="app.editExerciseSimpleConfigForm.success"
                  defaultMessage="Configuration was changed."
                />
              )
            }}
          />
        </p>
      </div>
    );
  }
}

EditExerciseSimpleConfigForm.propTypes = {
  initialValues: PropTypes.object,
  values: PropTypes.array,
  handleSubmit: PropTypes.func.isRequired,
  anyTouched: PropTypes.bool,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
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
    for (const inputFilePair of test.inputFiles) {
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
    validate
  })(EditExerciseSimpleConfigForm)
);
