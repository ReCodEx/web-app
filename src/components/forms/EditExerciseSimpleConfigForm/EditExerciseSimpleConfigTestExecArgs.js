import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import { ExpandingTextField } from '../Fields';
import Confirm from '../../forms/Confirm';
import Icon from '../../icons';
import Explanation from '../../widgets/Explanation';
import Button from '../../widgets/TheButton';

const EditExerciseSimpleConfigTestExecArgs = ({ smartFillArgs, test, testErrors, readOnly = false }) => (
  <>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.cmdlineTitle" defaultMessage="Command Line" />
    </h4>

    <FieldArray
      name={`${test}.run-args`}
      component={ExpandingTextField}
      maxLength={64}
      readOnly={readOnly}
      label={
        <>
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.executionArguments"
            defaultMessage="Execution arguments:"
          />
          <Explanation id={`${test}.run-args-explanation`}>
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.argumentsExplanation"
              defaultMessage="Please, place individual arguments into individual input boxes. Any whitespace inside the input box will be treated as a regular part of the argument value (not as a separator of arguments)."
            />
          </Explanation>
        </>
      }
    />

    {Boolean(smartFillArgs) && !readOnly && (
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
          <Button variant={'primary'} size="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillArgs" defaultMessage="Smart Fill Arguments" />
          </Button>
        </Confirm>
      </div>
    )}
  </>
);

EditExerciseSimpleConfigTestExecArgs.propTypes = {
  smartFillArgs: PropTypes.func,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default EditExerciseSimpleConfigTestExecArgs;
