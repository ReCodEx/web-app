import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Button, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import { LoadingIcon, SearchIcon, WarningIcon } from '../Icons';

// some additional styling for a scrolable vertical box
import styles from './search.less';

class Search extends Component {

  render() {
    const {
      id = '',
      onChange,
      isLoading,
      hasFailed,
      query,
      foundItems,
      renderList
    } = this.props;

    return (
      <div>
        <FormGroup>
          <ControlLabel htmlFor={id}>
            <FormattedMessage id='app.search.title' defaultMessage='Search:' />
          </ControlLabel>
          <InputGroup>
            <FormControl id={id} onChange={e => { this.query = e.target.value; }} />
            <InputGroup.Button>
              <Button
                onClick={() => onChange(this.query)}
                disabled={false && !isLoading && !hasFailed}>
                {isLoading && <LoadingIcon />}
                {hasFailed && <WarningIcon />}
                {!isLoading && !hasFailed && <SearchIcon />}
              </Button>
            </InputGroup.Button>
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
  }
}

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
