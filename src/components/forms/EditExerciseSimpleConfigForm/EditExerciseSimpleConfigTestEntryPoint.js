import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { FormLabel } from 'react-bootstrap';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { TextField } from '../Fields';
import Confirm from '../../forms/Confirm';

// At the moment, the validation is tailored to Haskell. This may change in the future.
const entryPointValidate = value => {
  return value && value.match(/^([A-Z][a-zA-Z0-9_]*[.])?[a-z][a-zA-Z0-9_]*$/) ? undefined : (
    <FormattedMessage
      id="app.editExerciseSimpleConfigTests.validation.sentryPointString"
      defaultMessage="The entry point value must be an identifier."
    />
  );
};

const EditExerciseSimpleConfigTestEntryPoint = ({ smartFillEntryPoint, test, testErrors, readOnly = false }) => (
  <table className="full-width">
    <tbody>
      <tr>
        <td>
          <FormLabel>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.entryPointLabel"
              defaultMessage="Entry point identifier:"
            />
          </FormLabel>
        </td>
      </tr>
      <tr>
        <td className="full-width">
          <Field
            name={`${test}.entry-point-string`}
            component={TextField}
            maxLength={256}
            validate={entryPointValidate}
            label={null}
            disabled={readOnly}
          />
        </td>

        {!readOnly && (
          <td className="valign-top">
            {Boolean(smartFillEntryPoint) && (
              <Confirm
                id="smartFillEntryPoint"
                onConfirmed={smartFillEntryPoint}
                question={
                  <FormattedMessage
                    id="app.editExerciseConfigForm.smartFillEntryPoint.yesNoQuestion"
                    defaultMessage="Do you really wish to overwrite entry-point configuration of all subsequent tests using the first test as a template?"
                  />
                }>
                <Button variant="primary" className="btn-flat" disabled={Boolean(testErrors)}>
                  <Icon icon="arrows-alt" gapRight />
                  <FormattedMessage
                    id="app.editExerciseConfigForm.smartFillEntryPoint"
                    defaultMessage="Smart Fill Entry Point"
                  />
                </Button>
              </Confirm>
            )}
          </td>
        )}
      </tr>
    </tbody>
  </table>
);

EditExerciseSimpleConfigTestEntryPoint.propTypes = {
  smartFillEntryPoint: PropTypes.func,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestEntryPoint;
