import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople, searchStatus } from '../../redux/modules/search';
import { getSearchStatus, getSearchResults, getSearchQuery } from '../../redux/selectors/search';

import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import SearchUsers from '../../components/Users/SearchUsers';

const getId = groupId => `add-student-${groupId}`;

const AddStudentContainer = ({
  groupId,
  query,
  search,
  status,
  users
}) => (
  <SearchUsers
    id={getId(groupId)}
    users={users}
    query={query}
    isReady={status === searchStatus.READY}
    isLoading={status === searchStatus.PENDING}
    hasFailed={status === searchStatus.FAILED}
    onChange={search}
    createActions={id => (
      <LeaveJoinGroupButtonContainer
        userId={id}
        groupId={groupId} />
    )} />
);

AddStudentContainer.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  query: PropTypes.string,
  status: PropTypes.string,
  users: ImmutablePropTypes.list.isRequired
};

const mapStateToProps = (state, { groupId }) => ({
  status: getSearchStatus(getId(groupId))(state),
  query: getSearchQuery(getId(groupId))(state),
  users: getSearchResults(getId(groupId))(state)
});

const mapDispatchToProps = (dispatch, { instanceId, groupId }) => ({
  search: (query) => dispatch(searchPeople(instanceId)(getId(groupId), query))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddStudentContainer);
