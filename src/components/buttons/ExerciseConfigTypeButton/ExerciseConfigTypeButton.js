import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import Confirm from '../../forms/Confirm';

const ExerciseConfigTypeButton = ({
  isSimple,
  setExerciseConfigType,
  disabled = false,
  question = (
    <FormattedMessage
      id="app.exerciseConfigTypeButton.confirm"
      defaultMessage="This operation may not be simply reversed, since the configuration type can be changed only under certain conditions. Do you wish to proceed?"
    />
  ),
  ...props
}) => (
  <Confirm id="confirm-exercise-config-type-change" onConfirmed={setExerciseConfigType} question={question}>
    <Button disabled={disabled} variant="primary" {...props}>
      <Icon icon={isSimple ? 'cubes' : 'cube'} gapRight />
      {isSimple ? (
        <FormattedMessage
          id="app.exerciseConfigTypeButton.advancedConfiguration"
          defaultMessage="Advanced Configuration"
        />
      ) : (
        <FormattedMessage id="app.exerciseConfigTypeButton.simpleConfiguration" defaultMessage="Simple Configuration" />
      )}
    </Button>
  </Confirm>
);

ExerciseConfigTypeButton.propTypes = {
  isSimple: PropTypes.bool.isRequired,
  setExerciseConfigType: PropTypes.func,
  disabled: PropTypes.bool,
  question: PropTypes.any,
};

export default ExerciseConfigTypeButton;
