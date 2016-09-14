import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Throttle } from 'react-throttle';

import UsersList from '../UsersList';
import { LoadingIcon, SuccessIcon, WarningIcon } from '../../Icons';

const SearchUsers = ({
  id = '',
  onChange,
  isLoading,
  hasFailed,
  isReady,
  query,
  users = [],
  createActions
}) => (
  <div>
    <FormGroup>
      <ControlLabel htmlFor={`search-${id}`}>
        <FormattedMessage id='app.search.searchUser' defaultMessage='Search:' />
      </ControlLabel>
      <Throttle time={300} handler='onChange'>
        <FormControl id={`search-${id}`} onChange={e => onChange(e.target.value)} />
      </Throttle>
    </FormGroup>
    {query && query.length > 0 && (
      <p>
        {isLoading && <LoadingIcon />}
        {hasFailed && <WarningIcon />}
        {isReady && <SuccessIcon />}
        {' '}<FormattedMessage id='app.search.query' defaultMessage='Searched query: {query}' values={{ query }} />
      </p>
    )}
    <UsersList
      users={users}
      createActions={createActions} />
  </div>
);

SearchUsers.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  createActions: PropTypes.func,
  users: ImmutablePropTypes.list.isRequired
};

export default SearchUsers;
