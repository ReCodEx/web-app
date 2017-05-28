import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SuccessIcon } from '../../icons';

const SuccessfulForkExerciseButton = ({ onClick, ...props }) => (
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
