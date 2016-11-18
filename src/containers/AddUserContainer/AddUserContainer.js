import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { searchPeople } from '../../redux/modules/search';
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
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  createActions: PropTypes.func
};

const mapDispatchToProps = (dispatch, { instanceId }) => ({
  search: (id, query) => dispatch(searchPeople(instanceId)(id, query))
});

export default connect(undefined, mapDispatchToProps)(AddUserContainer);
