import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/PageContent';
import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
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
      ? group.data.name
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
            <GroupDetail group={group} assignments={assignments} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { groupId } }) => {
    const group = state.groups.getIn([ 'resources', groupId ]); // @todo use a selector
    return {
      group,
      assignments: isReady(group) ? group.data.assignments.map(id => state.assignments.getIn([ 'resources', id ])) : [] // @todo use a selector
    };
  },
  (dispatch) => ({
    loadGroupIfNeeded: (groupId) => dispatch(fetchGroupIfNeeded(groupId)),
    loadAssignmentsIfNeeded: (groupId) => dispatch(fetchAssignmentsForGroup(groupId))
  })
)(Group);
