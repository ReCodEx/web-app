import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeSupervisor, removeSupervisor } from '../../redux/modules/groups';
import { fetchProfileIfNeeded } from '../../redux/modules/publicProfiles';
import { isSupervisorOf } from '../../redux/selectors/users';

import MakeSupervisorButton from '../../components/Groups/MakeSupervisorButton';
import RemoveSupervisorButton from '../../components/Groups/RemoveSupervisorButton';

const MakeRemoveSupervisorButtonContainer = ({
  isSupervisor,
  userId,
  groupId,
  makeSupervisor,
  removeSupervisor,
  fetchUserIfNeeded,
  ...props
}) =>
  isSupervisor
    ? <RemoveSupervisorButton
        {...props}
        onClick={() => removeSupervisor(groupId, userId)}
        bsSize="xs"
      />
    : <MakeSupervisorButton
        {...props}
        onClick={() => {
          fetchProfileIfNeeded(userId).then(() =>
            makeSupervisor(groupId, userId)
          );
        }}
        bsSize="xs"
      />;

MakeRemoveSupervisorButtonContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  isSupervisor: PropTypes.bool.isRequired,
  makeSupervisor: PropTypes.func.isRequired,
  removeSupervisor: PropTypes.func.isRequired,
  fetchUserIfNeeded: PropTypes.func.isRequired
};

const mapStateToProps = (state, { groupId, userId }) => ({
  isSupervisor: isSupervisorOf(userId, groupId)(state)
});

const mapDispatchToProps = {
  makeSupervisor,
  removeSupervisor,
  fetchProfileIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(
  MakeRemoveSupervisorButtonContainer
);
