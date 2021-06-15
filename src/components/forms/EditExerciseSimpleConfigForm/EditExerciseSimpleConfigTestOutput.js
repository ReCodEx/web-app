import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/TheButton';
import Icon from '../../icons';
import { SelectField, TextField, CheckboxField } from '../Fields';
import Confirm from '../../forms/Confirm';

const validateOutputFile = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.outputFile"
      defaultMessage="Please, fill in the name of the output file."
    />
  ) : undefined;

const validateExpectedOutput = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.expectedOutput"
      defaultMessage="Please, fill in the expected output file."
    />
  ) : undefined;

const EditExerciseSimpleConfigTestOutput = ({
  smartFillOutput,
  supplementaryFiles,
  test,
  testErrors,
  useOutFile,
  showOutFile = true,
  readOnly = false,
}) => (
  <>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.outputTitle" defaultMessage="Output" />
    </h4>

    {showOutFile && (
      <Field
        name={`${test}.useOutFile`}
        component={CheckboxField}
        onOff
        disabled={readOnly}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.useOutfile"
            defaultMessage="Use output file instead of stdout"
          />
        }
      />
    )}

    {showOutFile && useOutFile && (
      <Field
        name={`${test}.actual-output`}
        component={TextField}
        validate={validateOutputFile}
        maxLength={64}
        disabled={readOnly}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.outputFile" defaultMessage="Output file:" />}
      />
    )}

    <Field
      name={`${test}.expected-output`}
      component={SelectField}
      options={supplementaryFiles}
      addEmptyOption={true}
      validate={validateExpectedOutput}
      disabled={readOnly}
      label={
        <FormattedMessage id="app.editExerciseSimpleConfigTests.expectedOutput" defaultMessage="Expected output:" />
      }
    />

    {Boolean(smartFillOutput) && !readOnly && (
      <div className="smart-fill-tinybar">
        <Confirm
          id="smartFillOutput"
          onConfirmed={smartFillOutput}
          question={
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillOutput.yesNoQuestion"
              defaultMessage="Do you really wish to overwrite output configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
            />
          }>
          <Button variant={'primary'} size="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillOutput" defaultMessage="Smart Fill Outputs" />
          </Button>
        </Confirm>
      </div>
    )}
  </>
);

EditExerciseSimpleConfigTestOutput.propTypes = {
  smartFillOutput: PropTypes.func,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  useOutFile: PropTypes.bool,
  showOutFile: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestOutput;
