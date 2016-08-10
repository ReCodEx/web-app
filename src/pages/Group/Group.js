import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import PageContent from '../../components/PageContent';
import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { groupSelector, createGroupsAssignmentsSelector } from '../../redux/selectors/groups';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';

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
    const { params: { groupId }, loadAssignmentsIfNeeded, loadGroupIfNeeded } = props;
    loadAssignmentsIfNeeded(groupId);
    loadGroupIfNeeded(groupId);
  };

  getTitle = (group) =>
    isReady(group)
      ? group.getIn(['data', 'name'])
      : <FormattedMessage id='app.group.loading' defaultMessage="Loading group's detail ..." />;

  render() {
    const {
      group,
      assignments
    } = this.props;

    return (
      <PageContent
        title={this.getTitle(group)}
        description={<FormattedMessage id='app.group.description' defaultMessage='Group overview and assignments' />}>
        <div>
          {isLoading(group) && <LoadingGroupDetail />}
          {hasFailed(group) && <FailedGroupDetail />}
          {isReady(group) &&
            <GroupDetail group={group.toJS()} assignments={assignments} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { groupId } }) => {
    const groupsAssignmentsSelector = createGroupsAssignmentsSelector();
    const group = groupSelector(state, groupId);
    return {
      group,
      assignments: groupsAssignmentsSelector(state, groupId)
    };
  },
  (dispatch) => ({
    loadGroupIfNeeded: (groupId) => dispatch(fetchGroupIfNeeded(groupId)),
    loadAssignmentsIfNeeded: (groupId) => dispatch(fetchAssignmentsForGroup(groupId))
  })
)(Group);
