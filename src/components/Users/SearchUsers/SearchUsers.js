import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import { Debounce } from 'react-throttle';

import UsersList from '../UsersList';
import { LoadingIcon, SearchIcon, WarningIcon } from '../../Icons';

const usersListStyles = {
  maxHeight: 500,
  overflowY: 'auto',
  overflowX: 'hidden'
};

const getId = id => `search-${id}`;

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
      <ControlLabel htmlFor={getId(id)}>
        <FormattedMessage id='app.search.searchUser' defaultMessage='Search:' />
      </ControlLabel>
      <InputGroup>
        <InputGroup.Addon>
          {isLoading && <LoadingIcon />}
          {hasFailed && <WarningIcon />}
          {!isLoading && !hasFailed && <SearchIcon />}
        </InputGroup.Addon>
        <Debounce time={300} handler='onChange'>
          <FormControl id={getId(id)} onChange={e => onChange(id, e.target.value)} />
        </Debounce>
      </InputGroup>
    </FormGroup>
    {query && query.length > 0 && (
      <div>
        <p>
          {' '}<FormattedMessage id='app.search.query' defaultMessage='Searched query: ' />
          <strong><em>"{query}"</em></strong>
        </p>

        {(!isLoading || users.size > 0) && (
          <div style={usersListStyles}>
            <UsersList
              users={users.toJS()}
              createActions={createActions} />
          </div>
        )}
      </div>
    )}
  </div>
);

SearchUsers.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  createActions: PropTypes.func,
  users: ImmutablePropTypes.list.isRequired
};

export default SearchUsers;
