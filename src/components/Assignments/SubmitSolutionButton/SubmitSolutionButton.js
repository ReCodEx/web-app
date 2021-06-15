import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import Icon from '../../icons';

const SubmitSolutionButton = ({ disabled = false, onClick }) => (
  <Button variant="success" disabled={disabled} onClick={onClick}>
    <Icon icon="bug" gapRight />
    <FormattedMessage id="app.solutionsTable.submitNewSolution" defaultMessage="Submit New Solution" />
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SubmitSolutionButton;
