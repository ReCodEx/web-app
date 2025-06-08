import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { UnlockIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ExamUnlockButton = ({ pending = false, disabled = false, unlockUserForExam, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : 'warning'}
    onClick={unlockUserForExam}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight={2} /> : <UnlockIcon gapRight={2} />}
    <FormattedMessage id="app.groupExams.unlockStudentButton" defaultMessage="Unlock" />
  </Button>
);

ExamUnlockButton.propTypes = {
  pending: PropTypes.bool,
  disabled: PropTypes.bool,
  unlockUserForExam: PropTypes.func.isRequired,
};

export default ExamUnlockButton;
