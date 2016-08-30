import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import PageContent from '../../components/PageContent';
import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { groupSelector, createGroupsAssignmentsSelector } from '../../redux/selectors/groups';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';

class Group extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.groupId !== newProps.params.groupId) {
      this.loadData(newProps);
    }
  }

  loadData = (props) => {
    const { params: { groupId }, loadAssignmentsIfNeeded, loadGroupIfNeeded, loadStatsIfNeeded } = props;
    loadAssignmentsIfNeeded(groupId);
    loadStatsIfNeeded(groupId);
    loadGroupIfNeeded(groupId);
  };

  getTitle = (group) =>
    isReady(group)
      ? group.getIn(['data', 'name'])
      : <FormattedMessage id='app.group.loading' defaultMessage="Loading group's detail ..." />;

  render() {
    const {
      group,
      assignments,
      stats
    } = this.props;

    return (
      <PageContent
        title={this.getTitle(group)}
        description={<FormattedMessage id='app.group.description' defaultMessage='Group overview and assignments' />}>
        <div>
          {isLoading(group) && <LoadingGroupDetail />}
          {hasFailed(group) && <FailedGroupDetail />}
          {isReady(group) &&
            <GroupDetail
              group={group.toJS()}
              assignments={assignments}
              stats={stats} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { groupId } }) => ({
    group: groupSelector(groupId)(state),
    assignments: createGroupsAssignmentsSelector(groupId)(state),
    stats: createGroupsStatsSelector(groupId)(state)
  }),
  (dispatch) => ({
    loadGroupIfNeeded: (groupId) => dispatch(fetchGroupIfNeeded(groupId)),
    loadStatsIfNeeded: (groupId) => dispatch(fetchGroupsStatsIfNeeded(groupId)),
    loadAssignmentsIfNeeded: (groupId) => dispatch(fetchAssignmentsForGroup(groupId))
  })
)(Group);
