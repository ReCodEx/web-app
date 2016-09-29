import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople } from '../../redux/modules/search';
import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import SearchContainer from '../SearchContainer';
import UsersList from '../../components/Users/UsersList';

const AddUserContainer = ({
  id,
  groupId,
  search,
  createActions
}) => (
  <SearchContainer
    type='users'
    id={id}
    search={search}
    renderList={
      (users) => <UsersList users={users} createActions={createActions} />
    } />
);

AddUserContainer.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch, { instanceId }) => ({
  search: (id, query) => dispatch(searchPeople(instanceId)(id, query))
});

export default connect(undefined, mapDispatchToProps)(AddUserContainer);
