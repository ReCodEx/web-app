import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople, searchStatus } from '../../../redux/modules/search';
import { getSearchStatus, getSearchResults, getSearchQuery } from '../../../redux/selectors/search';

import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';

const AddStudent = ({
  groupId,
  instanceId
}) => (
  <AddUserContainer
    instanceId={instanceId}
    groupId={groupId}
    id={`add-student-${groupId}`}
    createActions={userId => (
      <LeaveJoinGroupButtonContainer
        userId={userId}
        groupId={groupId} />
    )} />
);

AddStudent.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired
};

export default AddStudent;
