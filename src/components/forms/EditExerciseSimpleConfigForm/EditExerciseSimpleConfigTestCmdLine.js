import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { ExpandingTextField } from '../Fields';
import Confirm from '../../forms/Confirm';

const EditExerciseSimpleConfigTestCmdLine = ({ smartFillArgs, test, testErrors }) => (
  <React.Fragment>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.cmdlineTitle" defaultMessage="Command Line" />
    </h4>

    <FieldArray
      name={`${test}.run-args`}
      component={ExpandingTextField}
      maxLength={64}
      label={
        <FormattedMessage
          id="app.editExerciseSimpleConfigTests.executionArguments"
          defaultMessage="Execution arguments:"
        />
      }
    />

    {Boolean(smartFillArgs) && (
      <div className="smart-fill-tinybar">
        <Confirm
          id="smartFillArgs"
          onConfirmed={smartFillArgs}
          question={
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillArgs.yesNoQuestion"
              defaultMessage="Do you really wish to overwrite command line configuration of all subsequent tests using the first test as a template?"
            />
          }>
          <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillArgs" defaultMessage="Smart Fill Arguments" />
          </Button>
        </Confirm>
      </div>
    )}
  </React.Fragment>
);

EditExerciseSimpleConfigTestCmdLine.propTypes = {
  smartFillArgs: PropTypes.func,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
};

export default EditExerciseSimpleConfigTestCmdLine;
