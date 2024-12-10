import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { UserLockIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const ExamLockButton = ({ pending, disabled = false, lockUserForExam, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : 'warning'}
    onClick={lockUserForExam}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight={2} /> : <UserLockIcon gapRight={2} />}
    <FormattedMessage id="app.groupExams.lockStudentButton" defaultMessage="Lock In" />
  </Button>
);

ExamLockButton.propTypes = {
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  lockUserForExam: PropTypes.func.isRequired,
};

export default ExamLockButton;
