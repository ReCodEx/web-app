import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople, searchStatus } from '../../../redux/modules/search';
import { getSearchStatus, getSearchResults, getSearchQuery } from '../../../redux/selectors/search';

import MakeRemoveSupervisorButtonContainer from '../../../containers/MakeRemoveSupervisorButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';

const AddSupervisor = ({
  groupId,
  instanceId
}) => (
  <AddUserContainer
    instanceId={instanceId}
    groupId={groupId}
    id={`add-supervisor-${groupId}`}
    createActions={userId => (
      <MakeRemoveSupervisorButtonContainer
        userId={userId}
        groupId={groupId} />
    )} />
);

AddSupervisor.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired
};

export default AddSupervisor;
