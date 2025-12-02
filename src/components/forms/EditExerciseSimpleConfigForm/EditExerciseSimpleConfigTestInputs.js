import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/TheButton';
import Icon from '../../icons';
import { SelectField, ExpandingInputFilesField } from '../Fields';
import Confirm from '../../forms/Confirm';

const EditExerciseSimpleConfigTestInputs = ({
  change,
  smartFillInputs,
  exerciseFiles,
  test,
  testErrors,
  showInputFiles = false,
  showStdinFile = false,
  readOnly = false,
}) => (
  <>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.inputTitle" defaultMessage="Input" />
    </h4>

    {showStdinFile && (
      <Field
        name={`${test}.stdin-file`}
        component={SelectField}
        options={exerciseFiles}
        addEmptyOption={true}
        disabled={readOnly}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.inputStdin" defaultMessage="Std. input:" />}
      />
    )}

    {showInputFiles && (
      <FieldArray
        name={`${test}.input-files`}
        component={ExpandingInputFilesField}
        options={exerciseFiles}
        change={change}
        readOnly={readOnly}
        leftLabel={
          <FormattedMessage id="app.editExerciseSimpleConfigTests.inputFilesActual" defaultMessage="Input file:" />
        }
        rightLabel={
          <FormattedMessage id="app.editExerciseSimpleConfigTests.inputFilesRename" defaultMessage="Rename as:" />
        }
        noItemsLabel={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.inputFilesNoItemsLabel"
            defaultMessage="Input files:"
          />
        }
      />
    )}

    {Boolean(smartFillInputs) && !readOnly && (
      <div className="smart-fill-tinybar">
        <Confirm
          id="smartFillInput"
          onConfirmed={smartFillInputs}
          question={
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillInput.yesNoQuestion"
              defaultMessage="Do you really wish to overwrite input configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
            />
          }>
          <Button variant={'primary'} size="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight={2} />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillInput" defaultMessage="Smart Fill Inputs" />
          </Button>
        </Confirm>
      </div>
    )}
  </>
);

EditExerciseSimpleConfigTestInputs.propTypes = {
  change: PropTypes.func.isRequired,
  smartFillInputs: PropTypes.func,
  exerciseFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  showInputFiles: PropTypes.bool,
  showStdinFile: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestInputs;
