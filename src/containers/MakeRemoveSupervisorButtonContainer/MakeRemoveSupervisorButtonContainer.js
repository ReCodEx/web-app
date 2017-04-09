import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { makeSupervisor, removeSupervisor } from '../../redux/modules/groups';
import { isSupervisorOf } from '../../redux/selectors/users';

import MakeSupervisorButton from '../../components/Groups/MakeSupervisorButton';
import RemoveSupervisorButton from '../../components/Groups/RemoveSupervisorButton';

const MakeRemoveSupervisorButtonContainer = ({
  isSupervisor,
  userId,
  groupId,
  makeSupervisor,
  removeSupervisor,
  ...props
}) =>
  isSupervisor
    ? <RemoveSupervisorButton {...props} onClick={() => removeSupervisor(groupId, userId)} bsSize="xs" />
    : <MakeSupervisorButton {...props} onClick={() => makeSupervisor(groupId, userId)} bsSize="xs" />;

MakeRemoveSupervisorButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isSupervisor: PropTypes.bool.isRequired,
  makeSupervisor: PropTypes.func.isRequired,
  removeSupervisor: PropTypes.func.isRequired
};

const mapStateToProps = (state, { groupId, userId }) => ({
  isSupervisor: isSupervisorOf(userId, groupId)(state)
});

const mapDispatchToProps = { makeSupervisor, removeSupervisor };

export default connect(mapStateToProps, mapDispatchToProps)(MakeRemoveSupervisorButtonContainer);
