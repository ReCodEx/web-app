import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import PaginationContainer from '../PaginationContainer';
import SimpleTextSearch from '../../components/helpers/SimpleTextSearch';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersList from '../../components/Users/UsersList';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { getPaginationFilters } from '../../redux/selectors/pagination';
import { EMPTY_OBJ } from '../../helpers/common';
import { FormattedMessage } from 'react-intl';

const LIMITS = [10];

const AddUserContainer = ({ id, filters, createActions, user }) =>
  <ResourceRenderer resource={user}>
    {user =>
      <PaginationContainer
        id={id}
        endpoint="users"
        defaultOrderBy="name"
        limits={LIMITS}
        hideAllItems={!filters.search}
        hideAllMessage={
          <div className="text-muted text-center">
            <FormattedMessage
              id="app.addUserContainer.emptyQuery"
              defaultMessage="No results. Enter a search query..."
            />
          </div>
        }
        filtersCreator={(filters, setFilters) =>
          <SimpleTextSearch
            query={filters.search || ''}
            isLoading={setFilters === null}
            onSubmit={search => setFilters({ search: search.trim() })}
          />}
      >
        {({ data }) => {
          return (
            <UsersList
              users={data}
              loggedUserId={user.id}
              useGravatar={user.privateData.settings.useGravatar}
              createActions={createActions}
            />
          );
        }}
      </PaginationContainer>}
  </ResourceRenderer>;

AddUserContainer.propTypes = {
  id: PropTypes.string.isRequired,
  instanceId: PropTypes.string.isRequired,
  createActions: PropTypes.func,
  user: ImmutablePropTypes.map.isRequired,
  filters: PropTypes.object.isRequired
};

export default connect((state, { id }) => {
  return {
    user: loggedInUserSelector(state),
    filters: getPaginationFilters(id)(state) || EMPTY_OBJ
  };
})(AddUserContainer);
