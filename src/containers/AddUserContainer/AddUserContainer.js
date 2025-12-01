import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { lruMemoize } from 'reselect';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import PaginationContainer from '../PaginationContainer';
import SimpleTextSearch from '../../components/helpers/SimpleTextSearch';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersList from '../../components/Users/UsersList';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import { getPaginationFilters } from '../../redux/selectors/pagination.js';
import { EMPTY_OBJ } from '../../helpers/common.js';

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

const messages = defineMessages({
  emptyQueryPlaceholder: {
    id: 'app.addUserContainer.emptyQuery',
    defaultMessage: 'Enter a name or its part...',
  },
});

const AddUserContainer = ({ id, filters, createActions, user, rolesFilter = null, intl: { formatMessage } }) => (
  <ResourceRenderer resource={user}>
    {user => (
      <PaginationContainer
        id={id}
        endpoint="users"
        defaultOrderBy="name"
        limits={LIMITS}
        hideAllItems={!filters.search}
        hideAllMessage={null}
        filtersCreator={(filters, setFilters) => (
          <SimpleTextSearch
            query={filters.search || ''}
            isLoading={setFilters === null}
            onSubmit={submitHandler(rolesFilter, setFilters)}
            label={
              <>
                <FormattedMessage id="app.addUserContainer.searchUser" defaultMessage="Search user" />:
              </>
            }
            placeholder={formatMessage(messages.emptyQueryPlaceholder)}
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
  intl: PropTypes.object,
};

export default connect((state, { id }) => {
  return {
    user: loggedInUserSelector(state),
    filters: getPaginationFilters(id)(state) || EMPTY_OBJ,
  };
})(injectIntl(AddUserContainer));
