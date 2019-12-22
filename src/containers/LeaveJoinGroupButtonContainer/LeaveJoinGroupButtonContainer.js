import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { joinGroup, leaveGroup, fetchGroup } from '../../redux/modules/groups';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats';
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
  fetchGroupStatsIfNeeded,
  bsSize = 'xs',
  history: { replace },
  links: { DASHBOARD_URI },
  ...props
}) =>
  isStudent ? (
    userId === currentUserId ? (
      <LeaveGroupButton
        {...props}
        onClick={() => leaveGroup(groupId, userId).then(() => replace(DASHBOARD_URI))}
        bsSize={bsSize}
      />
    ) : (
      <RemoveFromGroupButton {...props} onClick={() => leaveGroup(groupId, userId)} bsSize={bsSize} />
    )
  ) : (
    <JoinGroupButton
      {...props}
      onClick={() =>
        joinGroup(groupId, userId).then(() =>
          Promise.all([fetchGroup(groupId), fetchAssignmentsForGroup(groupId), fetchGroupStatsIfNeeded(groupId)])
        )
      }
      bsSize={bsSize}
    />
  );

LeaveJoinGroupButtonContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  groupId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isStudent: PropTypes.bool.isRequired,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired,
  fetchAssignmentsForGroup: PropTypes.func.isRequired,
  fetchGroup: PropTypes.func.isRequired,
  fetchGroupStatsIfNeeded: PropTypes.func.isRequired,
  bsSize: PropTypes.string,
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
  fetchGroupStatsIfNeeded: gId => dispatch(fetchGroupStatsIfNeeded(gId)),
});

export default withLinks(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(LeaveJoinGroupButtonContainer))
);
