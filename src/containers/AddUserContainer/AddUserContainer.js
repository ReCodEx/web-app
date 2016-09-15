import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople, searchStatus } from '../../redux/modules/search';
import { getSearchStatus, getSearchResults, getSearchQuery } from '../../redux/selectors/search';

import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import SearchUsers from '../../components/Users/SearchUsers';

const AddUserContainer = ({
  id,
  groupId,
  query,
  search,
  status,
  users,
  createActions
}) => (
  <SearchUsers
    id={id}
    users={users}
    query={query}
    isReady={status === searchStatus.READY}
    isLoading={status === searchStatus.PENDING}
    hasFailed={status === searchStatus.FAILED}
    onChange={search}
    createActions={createActions} />
);

AddUserContainer.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  query: PropTypes.string,
  status: PropTypes.string,
  users: ImmutablePropTypes.list.isRequired
};

const mapStateToProps = (state, { id }) => ({
  status: getSearchStatus(id)(state),
  query: getSearchQuery(id)(state),
  users: getSearchResults(id)(state)
});

const mapDispatchToProps = (dispatch, { instanceId, id }) => ({
  search: (query) => dispatch(searchPeople(instanceId)(id, query))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddUserContainer);
