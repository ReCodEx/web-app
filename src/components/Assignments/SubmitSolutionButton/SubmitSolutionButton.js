import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

const SubmitSolutionButton = ({
  disabled = false,
  onClick
}) => (
  <Button
    bsStyle='success'
    className='btn-flat'
    disabled={disabled}
    onClick={onClick}>
      <Icon name='bug' /> <FormattedMessage id='app.submissionsTable.submitNewSolution' defaultMessage='Submit new solution' />
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default SubmitSolutionButton;
