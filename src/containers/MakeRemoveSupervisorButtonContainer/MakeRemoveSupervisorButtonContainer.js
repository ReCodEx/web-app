import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { makeSupervisor, removeSupervisor } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

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
    ? <RemoveSupervisorButton {...props} onClick={() => removeSupervisor(groupId, userId)} bsSize='xs' />
    : <MakeSupervisorButton {...props} onClick={() => makeSupervisor(groupId, userId)} bsSize='xs' />;

MakeRemoveSupervisorButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isSupervisor: PropTypes.bool.isRequired,
  makeSupervisor: PropTypes.func.isRequired,
  removeSupervisor: PropTypes.func.isRequired
};

const mapStateToProps = (state, { groupId, userId }) => {
  const group = groupSelector(groupId)(state);
  return {
    isSupervisor: group && !!group
                              .getIn(['data', 'supervisors'])
                              .find(supervisor => supervisor.get('id') === userId)
  };
};

const mapDispatchToProps = { makeSupervisor, removeSupervisor };

export default connect(mapStateToProps, mapDispatchToProps)(MakeRemoveSupervisorButtonContainer);
