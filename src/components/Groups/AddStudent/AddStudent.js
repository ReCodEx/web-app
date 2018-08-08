import React from 'react';
import PropTypes from 'prop-types';

import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';

const AddStudent = ({ groupId, instanceId }) =>
  <AddUserContainer
    instanceId={instanceId}
    id={`add-student-${groupId}`}
    createActions={({ id }) =>
      <LeaveJoinGroupButtonContainer userId={id} groupId={groupId} />}
  />;

AddStudent.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired
};

export default AddStudent;
