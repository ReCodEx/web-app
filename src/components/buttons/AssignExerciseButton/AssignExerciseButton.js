import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Button from '../../widgets/FlatButton';
import { SendIcon, InfoIcon } from '../../../components/icons';

const AssignExerciseButton = ({
  isLocked,
  isBroken,
  assignExercise,
  ...props
}) => {
  if (isLocked || isBroken) {
    return (
      <Button bsSize="xs" className="btn-flat" disabled={true} {...props}>
        {isBroken ? <FontAwesomeIcon icon="medkit" /> : <InfoIcon />}
        {'  '}
        {isBroken
          ? <FormattedMessage
              id="app.assignExerciseButton.isBroken"
              defaultMessage="Broken"
            />
          : <FormattedMessage
              id="app.assignExerciseButton.isLocked"
              defaultMessage="Locked"
            />}
      </Button>
    );
  } else {
    return (
      <Button onClick={assignExercise} bsSize="xs" className="btn-flat">
        <SendIcon />
        {'  '}
        <FormattedMessage
          id="app.exercise.assignButton"
          defaultMessage="Assign"
        />
      </Button>
    );
  }
};

AssignExerciseButton.propTypes = {
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  assignExercise: PropTypes.func.isRequired
};

export default AssignExerciseButton;
