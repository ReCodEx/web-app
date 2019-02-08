import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { joinGroup, leaveGroup, fetchGroup } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf } from '../../redux/selectors/users';

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
  fetchGroupsStatsIfNeeded,
  bsSize = 'xs',
  push,
  links: { DASHBOARD_URI },
  ...props
}) =>
  isStudent ? (
    userId === currentUserId ? (
      <LeaveGroupButton
        {...props}
        onClick={() => leaveGroup(groupId, userId).then(push(DASHBOARD_URI))}
        bsSize={bsSize}
      />
    ) : (
      <RemoveFromGroupButton
        {...props}
        onClick={() => leaveGroup(groupId, userId)}
        bsSize={bsSize}
      />
    )
  ) : (
    <JoinGroupButton
      {...props}
      onClick={() =>
        joinGroup(groupId, userId).then(() =>
          Promise.all([
            fetchGroup(groupId),
            fetchAssignmentsForGroup(groupId),
            fetchGroupsStatsIfNeeded(groupId),
          ])
        )
      }
      bsSize={bsSize}
    />
  );

LeaveJoinGroupButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isStudent: PropTypes.bool.isRequired,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired,
  fetchAssignmentsForGroup: PropTypes.func.isRequired,
  fetchGroup: PropTypes.func.isRequired,
  fetchGroupsStatsIfNeeded: PropTypes.func.isRequired,
  bsSize: PropTypes.string,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
};

const mapStateToProps = (state, { userId, groupId }) => ({
  isStudent: isStudentOf(userId, groupId)(state),
  currentUserId: loggedInUserIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
  joinGroup: (gId, uId) => dispatch(joinGroup(gId, uId)),
  leaveGroup: (gId, uId) => dispatch(leaveGroup(gId, uId)),
  fetchAssignmentsForGroup: gId => dispatch(fetchAssignmentsForGroup(gId)),
  fetchGroup: gId => dispatch(fetchGroup(gId)),
  fetchGroupsStatsIfNeeded: gId => dispatch(fetchGroupsStatsIfNeeded(gId)),
  push: url => dispatch(push(url)),
});

export default withLinks(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeaveJoinGroupButtonContainer)
);
