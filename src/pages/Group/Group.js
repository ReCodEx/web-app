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
import { isSupervisorOf, isAdminOf } from '../../redux/selectors/users';
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
      students,
      supervisors = List(),
      assignments = List(),
      stats,
      isAdmin,
      isSupervisor
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
              students={students}
              supervisors={supervisors}
              assignments={assignments}
              stats={stats}
              isSupervisor={true}
              isAdmin={true} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { groupId } }) => {
    const group = groupSelector(groupId)(state);
    return {
      group,
      // supervisors: // @todo select from the state, // @todo "fetchIfNeeded" ??
      // students: // @todo select from the state, // @todo "fetchIfNeeded" ??
      assignments: createGroupsAssignmentsSelector(groupId)(state),
      stats: createGroupsStatsSelector(groupId)(state),
      isSupervisor: isSupervisorOf(groupId)(state),
      isAdmin: isAdminOf(groupId)(state)
    };
  },
  (dispatch) => ({
    loadGroupIfNeeded: (groupId) => dispatch(fetchGroupIfNeeded(groupId)),
    loadStatsIfNeeded: (groupId) => dispatch(fetchGroupsStatsIfNeeded(groupId)),
    loadAssignmentsIfNeeded: (groupId) => dispatch(fetchAssignmentsForGroup(groupId))
  })
)(Group);
