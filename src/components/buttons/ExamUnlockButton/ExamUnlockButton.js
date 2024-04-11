import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { UnlockIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ExamUnlockButton = ({ pending, disabled = false, unlockUserForExam, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : 'warning'}
    onClick={unlockUserForExam}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight /> : <UnlockIcon gapRight />}
    <FormattedMessage id="app.groupExams.unlockStudentButton" defaultMessage="Unlock" />
  </Button>
);

ExamUnlockButton.propTypes = {
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  unlockUserForExam: PropTypes.func.isRequired,
};

export default ExamUnlockButton;
