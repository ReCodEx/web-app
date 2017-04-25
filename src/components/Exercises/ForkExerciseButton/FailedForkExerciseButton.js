import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { FailedIcon } from '../../icons';

const FailedForkExerciseButton = (
  {
    onClick,
    ...props
  }
) => (
  <Button
    bsStyle="danger"
    bsSize="sm"
    className="btn-flat"
    onClick={onClick}
    {...props}
  >
    <FailedIcon />
    {' '}
    <FormattedMessage
      id="app.forkExerciseButton.failed"
      defaultMessage="Try forking the exercise again"
    />
  </Button>
);

FailedForkExerciseButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default FailedForkExerciseButton;
