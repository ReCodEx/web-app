import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Button from '../../widgets/FlatButton';
import { FormattedMessage } from 'react-intl';

const SubmitSolutionButton = ({ disabled = false, onClick }) =>
  <Button
    bsStyle="success"
    className="btn-flat"
    disabled={disabled}
    onClick={onClick}
  >
    <FontAwesomeIcon icon="bug" />{' '}
    <FormattedMessage
      id="app.submissionsTable.submitNewSolution"
      defaultMessage="Submit New Solution"
    />
  </Button>;

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default SubmitSolutionButton;
