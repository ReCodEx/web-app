import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';

import ExamLockButton from '../../components/buttons/ExamLockButton';
import { lockStudentForExam } from '../../redux/modules/groups';
import { groupPendingUserLock } from '../../redux/selectors/groups';
import { loggedInUserSelector } from '../../redux/selectors/users';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { getErrorMessage } from '../../locales/apiErrorMessages';
import { addNotification } from '../../redux/modules/notifications';

import { isStudentRole } from '../../components/helpers/usersRoles';

const lockStudentHandlingErrors = defaultMemoize(
  (userId, lockStudentForExam, addNotification, formatMessage) => () =>
    lockStudentForExam(userId).catch(err => {
      addNotification(getErrorMessage(formatMessage)(err), false);
    })
);

const ExamLockButtonContainer = ({
  groupId,
  currentUser,
  pending = null,
  lockStudentForExam,
  addNotification,
  intl: { formatMessage },
  ...props
}) => (
  <ResourceRenderer resource={currentUser}>
    {({ id, privateData: { groupLock, role } }) => (
      <ExamLockButton
        {...props}
        disabled={!isStudentRole(role) || groupLock || (pending && pending !== id)}
        pending={pending === id}
        lockUserForExam={lockStudentHandlingErrors(id, lockStudentForExam, addNotification, formatMessage)}
      />
    )}
  </ResourceRenderer>
);

ExamLockButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  currentUser: ImmutablePropTypes.map,
  pending: PropTypes.string,
  lockStudentForExam: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const mapStateToProps = (state, { groupId }) => ({
  pending: groupPendingUserLock(state, groupId),
  currentUser: loggedInUserSelector(state),
});

const mapDispatchToProps = (dispatch, { groupId }) => ({
  lockStudentForExam: userId => dispatch(lockStudentForExam(groupId, userId)),
  addNotification: (...args) => dispatch(addNotification(...args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ExamLockButtonContainer));
