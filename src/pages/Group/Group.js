import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';

import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';
import AdminsView from '../../components/Groups/AdminsView';
import SupervisorsView from '../../components/Groups/SupervisorsView';
import StudentsView from '../../components/Groups/StudentsView';

import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import { createGroup, fetchSubgroups, fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { isStudentOf, isSupervisorOf, isAdminOf } from '../../redux/selectors/users';
import { groupSelector, groupsSelectors, createGroupsAssignmentsSelector } from '../../redux/selectors/groups';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

class Group extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.groupId !== newProps.params.groupId) {
      this.loadData(newProps);
    }
  }

  loadData = ({
    params: { groupId },
    load,
    group,
    parentGroup
  }) => {
    load.groupIfNeeded(groupId);
    load.statsIfNeeded();
    isReady(group) && !parentGroup && load.groupIfNeeded(group.getIn(['data', 'parentGroupId']));
    isReady(group) && load.instanceIfNeeded(group.getIn(['data', 'instanceId']));
    load.subgroups();
  };

  getTitle = (group) =>
    isReady(group)
      ? group.getIn(['data', 'name'])
      : <FormattedMessage id='app.group.loading' defaultMessage="Loading group's detail ..." />;

  getBreadcrumbs = () => {
    const { group, instance, parentGroup } = this.props;
    const { links: { INSTANCE_URI_FACTORY, GROUP_URI_FACTORY } } = this.context;
    const breadcrumbs = [];

    if (isReady(instance)) {
      breadcrumbs.push({
        iconName: 'university',
        link: INSTANCE_URI_FACTORY(instance.getIn(['data', 'id'])),
        text: instance.getIn(['data', 'name'])
      });
    }

    if (parentGroup !== null && isReady(parentGroup)) {
      breadcrumbs.push({
        iconName: 'level-up',
        link: GROUP_URI_FACTORY(parentGroup.getIn(['data', 'id'])),
        text: parentGroup.getIn(['data', 'name'])
      });
    }

    // it doesn't make sense to add current group to the breadcrumbs
    // unless the instance or the parent group is loaded first
    if (breadcrumbs.length > 0 && isReady(group)) {
      breadcrumbs.push({
        iconName: 'group',
        text: group.getIn(['data', 'name'])
      });
    }

    return breadcrumbs;
  };

  render() {
    const {
      group,
      parentGroup,
      groups,
      students,
      supervisors = List(),
      assignments = List(),
      stats,
      isStudent,
      isAdmin,
      isSupervisor,
      addSubgroup
    } = this.props;

    const groupData = isReady(group) ? group.toJS().data : null;
    return (
      <PageContent
        title={this.getTitle(group)}
        description={<FormattedMessage id='app.group.description' defaultMessage='Group overview and assignments' />}
        breadcrumbs={this.getBreadcrumbs()}>
        <div>
          {isLoading(group) && <LoadingGroupDetail />}
          {hasFailed(group) && <FailedGroupDetail />}

          {isReady(group) && (
            <GroupDetail
              group={groupData} />
          )}

          {isReady(group) && isAdmin && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.adminsView.title' defaultMessage='Administrator controls of {groupName}' values={{ groupName: group.getIn(['data', 'name']) }} />
                </h3>
                <AdminsView
                  group={groupData}
                  groups={groups}
                  supervisors={supervisors}
                  addSubgroup={addSubgroup(groupData.instanceId)} />
              </Col>
            </Row>
          )}

          {isReady(group) && isSupervisor && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.supervisorsView.title' defaultMessage="Supervisor's controls of {groupName}" values={{ groupName: group.getIn(['data', 'name']) }} />
                </h3>
                <SupervisorsView
                  group={groupData}
                  stats={stats}
                  supervisors={supervisors}
                  students={students}
                  assignments={assignments} />
              </Col>
            </Row>
          )}

          {isReady(group) && isStudent && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.studentsView.title' defaultMessage="Student's dashboard for {groupName}" values={{ groupName: group.getIn(['data', 'name']) }} />
                </h3>
                <StudentsView
                  group={groupData}
                  assignments={assignments} />
              </Col>
            </Row>
          )}
        </div>
      </PageContent>
    );
  }

}

Group.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, { params: { groupId } }) => {
    const group = groupSelector(groupId)(state);
    return {
      group,
      // supervisors: // @todo select from the state, // @todo "fetchIfNeeded" ??
      // students: // @todo select from the state, // @todo "fetchIfNeeded" ??
      instance: isReady(group) ? instanceSelector(state, group.getIn(['data', 'instanceId'])) : null,
      parentGroup: isReady(group) ? groupSelector(group.getIn(['data', 'parentGroupId']))(state) : null,
      groups: groupsSelectors(state),
      assignments: createGroupsAssignmentsSelector(groupId)(state),
      stats: createGroupsStatsSelector(groupId)(state),
      isStudent: isStudentOf(groupId)(state),
      isSupervisor: isSupervisorOf(groupId)(state),
      isAdmin: isAdminOf(groupId)(state)
    };
  },
  (dispatch, { params: { groupId } }) => ({
    addSubgroup: (instanceId) => ({ name, description }) => dispatch(createGroup({ instanceId, name, description, parentGroupId: groupId })),
    load: {
      instanceIfNeeded: (id) => dispatch(fetchInstanceIfNeeded(id)),
      groupIfNeeded: (id) => dispatch(fetchGroupIfNeeded(groupId)),
      statsIfNeeded: () => dispatch(fetchGroupsStatsIfNeeded(groupId)),
      assignmentsIfNeeded: () => dispatch(fetchAssignmentsForGroup(groupId)),
      subgroups: () => dispatch(fetchSubgroups(groupId))
    }
  })
)(Group);
