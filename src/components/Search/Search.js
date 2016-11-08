import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import { Debounce } from 'react-throttle';
import { LoadingIcon, SearchIcon, WarningIcon } from '../Icons';

// some additional styling for a scrolable vertical box
import styles from './search.less';

const Search = ({
  id = '',
  type = 'general',
  onChange,
  isLoading,
  hasFailed,
  isReady,
  query,
  foundItems,
  renderList
}) => (
  <div>
    <FormGroup>
      <ControlLabel htmlFor={id}>
        <FormattedMessage id='app.search.title' defaultMessage='Search:' />
      </ControlLabel>
      <InputGroup>
        <InputGroup.Addon>
          {isLoading && <LoadingIcon />}
          {hasFailed && <WarningIcon />}
          {!isLoading && !hasFailed && <SearchIcon />}
        </InputGroup.Addon>
        <Debounce time={300} handler='onChange'>
          <FormControl id={id} onChange={e => onChange(id, e.target.value)} />
        </Debounce>
      </InputGroup>
    </FormGroup>
    {query && query.length > 0 && (
      <div>
        <p>
          {' '}<FormattedMessage id='app.search.query' defaultMessage='Searched query: ' />
          <strong><em>"{query}"</em></strong>
        </p>

        {(!isLoading || foundItems.size > 0) && (
          <div className={styles.list}>
            {renderList(foundItems.toJS())}
          </div>
        )}
      </div>
    )}
  </div>
);

Search.propTypes = {
  id: PropTypes.string,
  query: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  renderList: PropTypes.func,
  foundItems: ImmutablePropTypes.list.isRequired,
  isLoading: PropTypes.bool,
  hasFailed: PropTypes.bool,
  isReady: PropTypes.bool
};

export default Search;
