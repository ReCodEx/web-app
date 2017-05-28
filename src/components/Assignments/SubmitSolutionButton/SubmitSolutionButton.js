import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import Button from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const SubmitSolutionButton = ({ disabled = false, onClick }) => (
  <Button
    bsStyle="success"
    className="btn-flat"
    disabled={disabled}
    onClick={onClick}
  >
    <Icon name="bug" />
    {' '}
    <FormattedMessage
      id="app.submissionsTable.submitNewSolution"
      defaultMessage="Submit new solution"
    />
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default SubmitSolutionButton;
