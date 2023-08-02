import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { joinGroup, leaveGroup, fetchGroup } from '../../redux/modules/groups';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOfSelector } from '../../redux/selectors/usersGroups';

import JoinGroupButton from '../../components/buttons/JoinGroupButton';
import LeaveGroupButton from '../../components/buttons/LeaveGroupButton';
import RemoveFromGroupButton from '../../components/buttons/RemoveFromGroupButton';
import withLinks from '../../helpers/withLinks';

const LeaveJoinGroupButtonContainer = ({
  isStudent,
  currentUserId,
  userId,
  groupId,
  joinGroup,
  leaveGroup,
  fetchAssignmentsForGroup,
  fetchGroup,
  fetchGroupStatsIfNeeded,
  size = 'xs',
  links: { DASHBOARD_URI },
  redirectAfterLeave = false,
  onJoin = null,
  onLeave = null,
  ...props
}) => {
  const navigate = useNavigate();
  return isStudent ? (
    userId === currentUserId ? (
      <LeaveGroupButton
        {...props}
        onClick={() =>
          leaveGroup(groupId, userId).then(() => {
            onLeave && onLeave();
            redirectAfterLeave && navigate(DASHBOARD_URI, { replace: true });
          })
        }
        size={size}
      />
    ) : (
      <RemoveFromGroupButton {...props} onClick={() => leaveGroup(groupId, userId)} size={size} />
    )
  ) : (
    <JoinGroupButton
      {...props}
      onClick={() =>
        joinGroup(groupId, userId).then(() => {
          onJoin && onJoin();
          return Promise.all([
            fetchGroup(groupId),
            fetchAssignmentsForGroup(groupId),
            fetchGroupStatsIfNeeded(groupId),
          ]);
        })
      }
      size={size}
    />
  );
};

LeaveJoinGroupButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isStudent: PropTypes.bool.isRequired,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired,
  fetchAssignmentsForGroup: PropTypes.func.isRequired,
  fetchGroup: PropTypes.func.isRequired,
  fetchGroupStatsIfNeeded: PropTypes.func.isRequired,
  size: PropTypes.string,
  redirectAfterLeave: PropTypes.bool,
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  links: PropTypes.object,
};

const mapStateToProps = (state, { userId, groupId }) => ({
  isStudent: isStudentOfSelector(state, userId, groupId),
  currentUserId: loggedInUserIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
  joinGroup: (gId, uId) => dispatch(joinGroup(gId, uId)),
  leaveGroup: (gId, uId) => dispatch(leaveGroup(gId, uId)),
  fetchAssignmentsForGroup: gId => dispatch(fetchAssignmentsForGroup(gId)),
  fetchGroup: gId => dispatch(fetchGroup(gId)),
  fetchGroupStatsIfNeeded: gId => dispatch(fetchGroupStatsIfNeeded(gId)),
});

export default withLinks(connect(mapStateToProps, mapDispatchToProps)(LeaveJoinGroupButtonContainer));
