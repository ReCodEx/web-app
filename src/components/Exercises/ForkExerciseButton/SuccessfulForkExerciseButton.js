import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SuccessIcon } from '../../Icons';

const SuccessfulForkExerciseButton = (
  {
    onClick,
    ...props
  }
) => (
  <Button
    bsStyle="success"
    bsSize="sm"
    className="btn-flat"
    onClick={onClick}
    {...props}
  >
    <SuccessIcon />
    {' '}
    <FormattedMessage
      id="app.forkExerciseButton.success"
      defaultMessage="Show the forked exercise"
    />
  </Button>
);

SuccessfulForkExerciseButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default SuccessfulForkExerciseButton;
