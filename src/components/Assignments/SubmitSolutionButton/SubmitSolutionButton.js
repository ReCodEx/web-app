import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import Icon, { CodeFileIcon } from '../../icons';

const SubmitSolutionButton = ({ disabled = false, onClick }) => (
  <Button variant="success" disabled={disabled} onClick={onClick}>
    <span className="fa-layers fa-fw me-2">
      <CodeFileIcon transform="grow-2" />
      <Icon icon="share" className="opacity-75" transform="shrink-4 right-7 up-8" />
    </span>
    <FormattedMessage id="app.solutionsTable.submitNewSolution" defaultMessage="Submit New Solution" />
  </Button>
);

SubmitSolutionButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SubmitSolutionButton;
