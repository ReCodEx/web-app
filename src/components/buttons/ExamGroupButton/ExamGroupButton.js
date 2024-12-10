import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { GroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ExamGroupButton = ({ exam, pending, disabled = false, setExamFlag, ...props }) => (
  <Button {...props} variant={disabled ? 'secondary' : 'warning'} onClick={setExamFlag} disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight={2} /> : <GroupIcon exam={!exam} gapRight={2} />}
    {exam ? (
      <FormattedMessage id="app.groupTypeButton.regular" defaultMessage="Regular" />
    ) : (
      <FormattedMessage id="app.groupTypeButton.exam" defaultMessage="Exam" />
    )}
  </Button>
);

ExamGroupButton.propTypes = {
  exam: PropTypes.bool.isRequired,
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  setExamFlag: PropTypes.func.isRequired,
};

export default ExamGroupButton;
