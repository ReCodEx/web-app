import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SendIcon, InfoIcon } from '../../../components/icons';

const AssignExerciseButton = ({ isLocked, assignExercise, ...props }) => {
  if (isLocked) {
    return (
      <Button bsSize="xs" className="btn-flat" disabled={true} {...props}>
        <InfoIcon />
        {'  '}
        <FormattedMessage
          id="app.assignExerciseButton.isLocked"
          defaultMessage="Locked"
        />
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
  assignExercise: PropTypes.func.isRequired
};

export default AssignExerciseButton;
