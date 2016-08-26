import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { joinGroup, leaveGroup } from '../../redux/modules/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import JoinGroupButton from '../../components/Groups/JoinGroupButton';
import LeaveGroupButton from '../../components/Groups/LeaveGroupButton';

const LeaveJoinGroupButtonContainer = ({
  isMember,
  userId,
  groupId,
  joinGroup,
  leaveGroup,
  ...props
}) =>
  isMember
    ? <LeaveGroupButton {...props} onClick={() => leaveGroup(groupId, userId)} />
    : <JoinGroupButton {...props} onClick={() => joinGroup(groupId, userId)} />;

LeaveJoinGroupButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isMember: PropTypes.bool.isRequired,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  userId: loggedInUserIdSelector(state)
});

const mapDispatchToProps = { joinGroup, leaveGroup };

export default connect(mapStateToProps, mapDispatchToProps)(LeaveJoinGroupButtonContainer);
