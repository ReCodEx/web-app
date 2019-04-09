import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { TextField } from '../Fields';
import Confirm from '../../forms/Confirm';

// At the moment, the validation is tailored to Haskell. This may change in the future.
const entryPointValidate = value => {
  return value && value.match(/^([A-Z][a-zA-Z0-9_]*[.])?[a-z][a-zA-Z0-9_]*$/) ? (
    undefined
  ) : (
    <FormattedMessage
      id="app.editExerciseSimpleConfigTests.validation.sentryPointString"
      defaultMessage="The entry point value must be an identifier."
    />
  );
};

const EditExerciseSimpleConfigTestEntryPoint = ({ smartFillEntryPoint, test, testErrors }) => (
  <React.Fragment>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.entryPointTitle" defaultMessage="Entry Point" />
    </h4>

    <Field
      name={`${test}.entry-point-string`}
      component={TextField}
      maxLength={256}
      validate={entryPointValidate}
      label={
        <FormattedMessage
          id="app.editExerciseSimpleConfigTests.entryPointLabel"
          defaultMessage="Entry point identifier:"
        />
      }
    />

    {Boolean(smartFillEntryPoint) && (
      <div className="smart-fill-tinybar">
        <Confirm
          id="smartFillEntryPoint"
          onConfirmed={smartFillEntryPoint}
          question={
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillEntryPoint.yesNoQuestion"
              defaultMessage="Do you really wish to overwrite entry-point configuration of all subsequent tests using the first test as a template?"
            />
          }>
          <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillEntryPoint"
              defaultMessage="Smart Fill Entry Point"
            />
          </Button>
        </Confirm>
      </div>
    )}
  </React.Fragment>
);

EditExerciseSimpleConfigTestEntryPoint.propTypes = {
  smartFillEntryPoint: PropTypes.func,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
};

export default EditExerciseSimpleConfigTestEntryPoint;
