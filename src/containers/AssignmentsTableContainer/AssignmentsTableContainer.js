import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LoadingIcon } from '../../components/icons';

import { fetchAssignmentsForGroup } from '../../redux/modules/assignments.js';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats.js';
import { groupsAssignmentsSelector } from '../../redux/selectors/groups.js';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments.js';
import { createGroupsStatsSelector } from '../../redux/selectors/stats.js';

import { EMPTY_OBJ } from '../../helpers/common.js';

const getUserStats = lruMemoize((stats, userId) => (userId && stats.find(stat => stat.userId === userId)) || EMPTY_OBJ);

class AssignmentsTableContainer extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId || this.props.userId !== prevProps.userId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      userId = null,
      assignments,
      assignmentEnvironmentsSelector,
      stats,
      onlyCurrent = false,
      hideEmpty = false,
      noDiscussion = false,
    } = this.props;
    return hideEmpty && assignments.size === 0 ? null : (
      <ResourceRenderer
        resource={stats}
        loading={
          <div className="text-center p-2">
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </div>
        }>
        {stats => {
          const userStats = getUserStats(stats, userId);
          return (
            <AssignmentsTable
              userId={userId}
              assignments={assignments}
              assignmentEnvironmentsSelector={assignmentEnvironmentsSelector}
              stats={userStats}
              statuses={userStats && userStats.assignments}
              onlyCurrent={onlyCurrent}
              noDiscussion={noDiscussion}
            />
          );
        }}
      </ResourceRenderer>
    );
  }
}

AssignmentsTableContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  onlyCurrent: PropTypes.bool,
  hideEmpty: PropTypes.bool,
  noDiscussion: PropTypes.bool,
  assignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  stats: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    assignments: groupsAssignmentsSelector(state, groupId),
    assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
    stats: createGroupsStatsSelector(groupId)(state),
  }),
  (dispatch, { groupId, userId = null }) => ({
    loadAsync: () =>
      Promise.all([
        dispatch(fetchAssignmentsForGroup(groupId)),
        userId ? dispatch(fetchGroupStatsIfNeeded(groupId)) : null,
      ]),
  })
)(AssignmentsTableContainer);
