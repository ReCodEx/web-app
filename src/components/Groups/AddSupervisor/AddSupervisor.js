import React from 'react';
import PropTypes from 'prop-types';

import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';
import { knownRoles, isSupervisorRole } from '../../helpers/usersRoles';

const ROLES_FILTER = knownRoles.filter(isSupervisorRole);

const AddSupervisor = ({ groupId, instanceId }) =>
  <AddUserContainer
    instanceId={instanceId}
    id={`add-supervisor-${groupId}`}
    rolesFilter={ROLES_FILTER}
    createActions={({ id }) =>
      <MakeRemoveSupervisorButtonContainer userId={id} groupId={groupId} />}
  />;

AddSupervisor.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired
};

export default AddSupervisor;
