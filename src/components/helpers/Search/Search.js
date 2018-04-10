import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup
} from 'react-bootstrap';
import { LoadingIcon, SearchIcon, WarningIcon } from '../../icons';

// some additional styling for a scrolable vertical box
import styles from './search.less';

class Search extends Component {
  componentDidMount() {
    const { showAllOnEmptyQuery, onChange, query } = this.props;
    if (showAllOnEmptyQuery) {
      onChange(query);
    }
  }

  render() {
    const {
      id = '',
      onChange,
      isLoading,
      hasFailed,
      query,
      foundItems,
      renderList,
      showAllOnEmptyQuery = false
    } = this.props;

    return (
      <div>
        <form>
          <FormGroup>
            <ControlLabel htmlFor={id}>
              <FormattedMessage
                id="app.search.title"
                defaultMessage="Search:"
              />
            </ControlLabel>
            <InputGroup>
              <FormControl
                id={id}
                onChange={e => {
                  this.query = e.target.value;
                }}
              />
              <InputGroup.Button>
                <Button
                  type="submit"
                  onClick={e => {
                    e.preventDefault();
                    onChange(this.query);
                  }}
                  disabled={false && !isLoading && !hasFailed}
                >
                  {isLoading && <LoadingIcon />}
                  {hasFailed && <WarningIcon />}
                  {!isLoading && !hasFailed && <SearchIcon />}
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </form>
        {((query && query.length > 0) || showAllOnEmptyQuery) &&
          <div>
            {query.length > 0 &&
              <p>
                {' '}<FormattedMessage
                  id="app.search.query"
                  defaultMessage="Searched query: "
                />
                <strong>
                  <em>
                    {'"'}
                    {query}
                    {'"'}
                  </em>
                </strong>
              </p>}

            {(!isLoading || foundItems.size > 0) &&
              <div className={isLoading ? styles.loadingList : styles.list}>
                {renderList(foundItems.toJS())}
              </div>}
          </div>}
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
  isReady: PropTypes.bool,
  showAllOnEmptyQuery: PropTypes.bool
};

export default Search;
