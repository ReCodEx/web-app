import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { SelectField, ExpandingInputFilesField } from '../Fields';
import Confirm from '../../forms/Confirm';

const EditExerciseSimpleConfigTestInputs = ({
  change,
  smartFillInputs,
  supplementaryFiles,
  test,
  testErrors,
  showInputFiles = false,
  showStdinFile = false,
  readOnly = false,
}) => (
  <React.Fragment>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.inputTitle" defaultMessage="Input" />
    </h4>

    {showInputFiles && (
      <FieldArray
        name={`${test}.input-files`}
        component={ExpandingInputFilesField}
        options={supplementaryFiles}
        change={change}
        readOnly={readOnly}
        leftLabel={
          <FormattedMessage id="app.editExerciseSimpleConfigTests.inputFilesActual" defaultMessage="Input file:" />
        }
        rightLabel={
          <FormattedMessage id="app.editExerciseSimpleConfigTests.inputFilesRename" defaultMessage="Rename as:" />
        }
      />
    )}

    {showStdinFile && (
      <Field
        name={`${test}.stdin-file`}
        component={SelectField}
        options={supplementaryFiles}
        addEmptyOption={true}
        disabled={readOnly}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.inputStdin" defaultMessage="Std. input:" />}
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
          <Button variant={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillInput" defaultMessage="Smart Fill Inputs" />
          </Button>
        </Confirm>
      </div>
    )}
  </React.Fragment>
);

EditExerciseSimpleConfigTestInputs.propTypes = {
  change: PropTypes.func.isRequired,
  smartFillInputs: PropTypes.func,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  showInputFiles: PropTypes.bool,
  showStdinFile: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestInputs;
