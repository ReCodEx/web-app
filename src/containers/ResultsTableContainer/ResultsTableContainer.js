import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ResultsTable from '../../components/Groups/ResultsTable';
import { fetchGroupsStats } from '../../redux/modules/stats';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';

class ResultsTableContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.groupId !== newProps.groupId) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ groupId }, dispatch) =>
    dispatch(fetchGroupsStats(groupId));

  render() {
    const { users, assignments, stats } = this.props;
    return (
      <ResourceRenderer resource={stats}>
        {groupStats =>
          <ResultsTable
            users={users}
            assignments={assignments}
            stats={groupStats}
          />}
      </ResourceRenderer>
    );
  }
}

ResultsTableContainer.propTypes = {
  users: PropTypes.array.isRequired,
  assignments: PropTypes.array.isRequired,
  groupId: PropTypes.string.isRequired,
  stats: PropTypes.object.isRequired,
  loadAsync: PropTypes.func
};

export default connect(
  (state, { groupId }) => ({
    stats: createGroupsStatsSelector(groupId)(state)
  }),
  (dispatch, { groupId }) => ({
    loadAsync: () => ResultsTableContainer.loadAsync({ groupId }, dispatch)
  })
)(ResultsTableContainer);
