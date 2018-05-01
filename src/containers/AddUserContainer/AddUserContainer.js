import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchPeople } from '../../redux/modules/search';
import SearchContainer from '../SearchContainer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersList from '../../components/Users/UsersList';
import { loggedInUserSelector } from '../../redux/selectors/users';

const AddUserContainer = ({ id, groupId, search, createActions, user }) =>
  <ResourceRenderer resource={user}>
    {user =>
      <SearchContainer
        type="users"
        id={id}
        search={search}
        renderList={users =>
          <UsersList
            users={users}
            loggedUserId={user.id}
            useGravatar={user.privateData.settings.useGravatar}
            createActions={createActions}
          />}
      />}
  </ResourceRenderer>;

AddUserContainer.propTypes = {
  id: PropTypes.string.isRequired,
  instanceId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  createActions: PropTypes.func,
  user: ImmutablePropTypes.map.isRequired
};

const mapDispatchToProps = (dispatch, props) => ({
  search: query => dispatch(searchPeople(props.instanceId)(props.id, query))
});

export default connect(state => {
  return {
    user: loggedInUserSelector(state)
  };
}, mapDispatchToProps)(AddUserContainer);
