import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import Search from '../../components/helpers/Search';

import { searchStatus } from '../../redux/modules/search';
import {
  getSearchStatus,
  getSearchResults,
  getSearchQuery
} from '../../redux/selectors/search';

const SearchContainer = (
  {
    id,
    type = 'search',
    query,
    search,
    status,
    foundItems,
    renderList
  }
) => (
  <Search
    type={type}
    id={id}
    foundItems={foundItems}
    query={query}
    isReady={status === searchStatus.READY}
    isLoading={status === searchStatus.PENDING}
    hasFailed={status === searchStatus.FAILED}
    onChange={search}
    renderList={renderList}
  />
);

SearchContainer.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  search: PropTypes.func.isRequired,
  query: PropTypes.string,
  status: PropTypes.string,
  foundItems: ImmutablePropTypes.list.isRequired,
  renderList: PropTypes.func.isRequired
};

const mapStateToProps = (state, { id }) => {
  return {
    status: getSearchStatus(id)(state),
    query: getSearchQuery(id)(state),
    foundItems: getSearchResults(id)(state)
  };
};

export default connect(mapStateToProps)(SearchContainer);
