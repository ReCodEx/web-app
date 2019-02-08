import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const SubmitSolutionButton = ({ disabled = false, onClick }) => (
  <Button
    bsStyle="success"
    className="btn-flat"
    disabled={disabled}
    onClick={onClick}>
    <Icon icon="bug" gapRight />
    <FormattedMessage
      id="app.solutionsTable.submitNewSolution"
      defaultMessage="Submit New Solution"
    />
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SubmitSolutionButton;
