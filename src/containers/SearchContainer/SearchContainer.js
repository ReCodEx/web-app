import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { searchExercises, searchStatus } from '../../redux/modules/search';
import { getSearchStatus, getSearchResults, getSearchQuery } from '../../redux/selectors/search';

import LeaveJoinGroupButtonContainer from '../LeaveJoinGroupButtonContainer';
import Search from '../../components/Search';

const SearchContainer = ({
  id,
  query,
  search,
  status,
  exercises,
  renderList
}) => (
  <Search
    type='exercises'
    id={id}
    foundItems={exercises}
    query={query}
    isReady={status === searchStatus.READY}
    isLoading={status === searchStatus.PENDING}
    hasFailed={status === searchStatus.FAILED}
    onChange={search}
    renderList={renderList} />
);

SearchContainer.propTypes = {
  search: PropTypes.func.isRequired,
  query: PropTypes.string,
  status: PropTypes.string,
  exercises: ImmutablePropTypes.list.isRequired
};

const mapStateToProps = (state, { id }) => ({
  status: getSearchStatus(id)(state),
  query: getSearchQuery(id)(state),
  exercises: getSearchResults(id)(state)
});

export default connect(mapStateToProps)(SearchContainer);
