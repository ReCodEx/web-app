import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';

const SubmitSolutionButton = ({
  disabled = false,
  onClick
}) => (
  <Button
    bsStyle='success'
    className='btn-flat'
    disabled={disabled}
    onClick={onClick}>
    Odevzdat nové řešení
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default SubmitSolutionButton;
