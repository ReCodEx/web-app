import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { lruMemoize } from 'reselect';

import ExamUnlockButton from '../../components/buttons/ExamUnlockButton';
import { unlockStudentFromExam } from '../../redux/modules/groups';
import { groupPendingUserUnlock } from '../../redux/selectors/groups';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { getErrorMessage } from '../../locales/apiErrorMessages';
import { addNotification } from '../../redux/modules/notifications';

const unlockStudentHandlingErrors = lruMemoize(
  (unlockStudentFromExam, addNotification, formatMessage) => () =>
    unlockStudentFromExam().catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    })
);

const ExamUnlockButtonContainer = ({
  groupId,
  userId,
  pending = null,
  unlockStudentFromExam,
  addNotification,
  intl: { formatMessage },
  ...props
}) => (
  <ExamUnlockButton
    {...props}
    pending={pending}
    unlockUserForExam={unlockStudentHandlingErrors(unlockStudentFromExam, addNotification, formatMessage)}
  />
);

ExamUnlockButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  pending: PropTypes.string,
  unlockStudentFromExam: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const mapStateToProps = (state, { groupId }) => ({
  pending: groupPendingUserUnlock(state, groupId),
  currentUser: loggedInUserSelector(state),
});

const mapDispatchToProps = (dispatch, { groupId, userId }) => ({
  unlockStudentFromExam: () => dispatch(unlockStudentFromExam(groupId, userId)),
  addNotification: (...args) => dispatch(addNotification(...args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ExamUnlockButtonContainer));
