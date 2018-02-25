import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { joinGroup, leaveGroup, fetchGroup } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf } from '../../redux/selectors/users';

import JoinGroupButton from '../../components/buttons/JoinGroupButton';
import LeaveGroupButton from '../../components/buttons/LeaveGroupButton';
import RemoveFromGroupButton from '../../components/buttons/RemoveFromGroupButton';

const LeaveJoinGroupButtonContainer = ({
  isStudent,
  currentUserId,
  userId,
  groupId,
  joinGroup,
  leaveGroup,
  fetchAssignmentsForGroup,
  fetchGroup,
  fetchGroupsStatsIfNeeded,
  ...props
}) =>
  isStudent
    ? userId === currentUserId
      ? <LeaveGroupButton
          {...props}
          onClick={() => leaveGroup(groupId, userId)}
          bsSize="xs"
        />
      : <RemoveFromGroupButton
          {...props}
          onClick={() => leaveGroup(groupId, userId)}
          bsSize="xs"
        />
    : <JoinGroupButton
        {...props}
        onClick={() =>
          joinGroup(groupId, userId).then(() =>
            Promise.all([
              fetchGroup(groupId),
              fetchAssignmentsForGroup(groupId),
              fetchGroupsStatsIfNeeded(groupId)
            ])
          )}
        bsSize="xs"
      />;

LeaveJoinGroupButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isStudent: PropTypes.bool.isRequired,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired,
  fetchAssignmentsForGroup: PropTypes.func.isRequired,
  fetchGroup: PropTypes.func.isRequired,
  fetchGroupsStatsIfNeeded: PropTypes.func.isRequired
};

const mapStateToProps = (state, { userId, groupId }) => ({
  isStudent: isStudentOf(userId, groupId)(state),
  currentUserId: loggedInUserIdSelector(state)
});

const mapDispatchToProps = {
  joinGroup,
  leaveGroup,
  fetchAssignmentsForGroup,
  fetchGroup,
  fetchGroupsStatsIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(
  LeaveJoinGroupButtonContainer
);
