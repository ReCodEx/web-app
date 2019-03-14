import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { SelectField, TextField, CheckboxField } from '../Fields';
import Confirm from '../../forms/Confirm';

const validateOutputFile = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.outputFile"
      defaultMessage="Please, fill in the name of the output file."
    />
  ) : (
    undefined
  );

const validateExpectedOutput = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.expectedOutput"
      defaultMessage="Please, fill in the expected output file."
    />
  ) : (
    undefined
  );

const EditExerciseSimpleConfigTestOutput = ({ smartFillOutput, supplementaryFiles, test, testErrors, useOutFile }) => (
  <React.Fragment>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.outputTitle" defaultMessage="Output" />
    </h4>

    <Field
      name={`${test}.useOutFile`}
      component={CheckboxField}
      onOff
      label={
        <FormattedMessage
          id="app.editExerciseSimpleConfigTests.useOutfile"
          defaultMessage="Use output file instead of stdout"
        />
      }
    />

    {useOutFile && (
      <Field
        name={`${test}.actual-output`}
        component={TextField}
        validate={validateOutputFile}
        maxLength={64}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.outputFile" defaultMessage="Output file:" />}
      />
    )}

    <Field
      name={`${test}.expected-output`}
      component={SelectField}
      options={supplementaryFiles}
      addEmptyOption={true}
      validate={validateExpectedOutput}
      label={
        <FormattedMessage id="app.editExerciseSimpleConfigTests.expectedOutput" defaultMessage="Expected output:" />
      }
    />

    {Boolean(smartFillOutput) && (
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
          <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillOutput" defaultMessage="Smart Fill Outputs" />
          </Button>
        </Confirm>
      </div>
    )}
  </React.Fragment>
);

EditExerciseSimpleConfigTestOutput.propTypes = {
  smartFillOutput: PropTypes.func,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  useOutFile: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestOutput;
