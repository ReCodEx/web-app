import React from 'react';
import PropTypes from 'prop-types';

import MakeRemoveSupervisorButtonContainer
  from '../../../containers/MakeRemoveSupervisorButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';

const AddSupervisor = ({ groupId, instanceId }) => (
  <AddUserContainer
    instanceId={instanceId}
    groupId={groupId}
    id={`add-supervisor-${groupId}`}
    createActions={userId => (
      <MakeRemoveSupervisorButtonContainer userId={userId} groupId={groupId} />
    )}
  />
);

AddSupervisor.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired
};

export default AddSupervisor;
