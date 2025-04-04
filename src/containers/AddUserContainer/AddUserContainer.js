import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { lruMemoize } from 'reselect';

import PaginationContainer from '../PaginationContainer';
import SimpleTextSearch from '../../components/helpers/SimpleTextSearch';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersList from '../../components/Users/UsersList';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import { getPaginationFilters } from '../../redux/selectors/pagination.js';
import { EMPTY_OBJ } from '../../helpers/common.js';
import { FormattedMessage } from 'react-intl';

const LIMITS = [10];

const submitHandler = lruMemoize((rolesFilter, setFilters) => search => {
  const filters = {};
  if (search && search.trim()) {
    filters.search = search.trim();
  }
  if (rolesFilter && rolesFilter.length > 0) {
    filters.roles = rolesFilter;
  }
  return setFilters(filters);
});

const AddUserContainer = ({ id, filters, createActions, user, rolesFilter = null }) => (
  <ResourceRenderer resource={user}>
    {user => (
      <PaginationContainer
        id={id}
        endpoint="users"
        defaultOrderBy="name"
        limits={LIMITS}
        hideAllItems={!filters.search}
        hideAllMessage={
          <div className="text-body-secondary text-center">
            <FormattedMessage
              id="app.addUserContainer.emptyQuery"
              defaultMessage="No results. Enter a search query..."
            />
          </div>
        }
        filtersCreator={(filters, setFilters) => (
          <SimpleTextSearch
            query={filters.search || ''}
            isLoading={setFilters === null}
            onSubmit={submitHandler(rolesFilter, setFilters)}
          />
        )}>
        {({ data }) => {
          return <UsersList users={data} loggedUserId={user.id} createActions={createActions} />;
        }}
      </PaginationContainer>
    )}
  </ResourceRenderer>
);

AddUserContainer.propTypes = {
  id: PropTypes.string.isRequired,
  instanceId: PropTypes.string.isRequired,
  createActions: PropTypes.func,
  rolesFilter: PropTypes.array,
  user: ImmutablePropTypes.map.isRequired,
  filters: PropTypes.object.isRequired,
};

export default connect((state, { id }) => {
  return {
    user: loggedInUserSelector(state),
    filters: getPaginationFilters(id)(state) || EMPTY_OBJ,
  };
})(AddUserContainer);
