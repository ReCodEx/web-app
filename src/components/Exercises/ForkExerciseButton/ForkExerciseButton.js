import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from 'react-fontawesome';
import Confirm from '../../forms/Confirm';

const ForkExerciseButton = ({ forkId, onClick, ...props }) => (
  <Confirm
    id={forkId}
    onConfirmed={onClick}
    question={
      <FormattedMessage
        id="app.forkExerciseButton.confirmation"
        defaultMessage="Do you really want to fork this exercise?"
      />
    }
  >
    <Button
      bsStyle="default"
      bsSize="sm"
      className="btn-flat"
      onClick={onClick}
      {...props}
    >
      <Icon name="code-fork" />
      {' '}
      <FormattedMessage
        id="app.forkExerciseButton.fork"
        defaultMessage="Fork the exercise"
      />
    </Button>
  </Confirm>
);

ForkExerciseButton.propTypes = {
  forkId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default ForkExerciseButton;
