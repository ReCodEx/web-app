import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import PageContent from '../../components/PageContent';

import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import AdminsView from '../../components/Groups/AdminsView';
import SupervisorsView from '../../components/Groups/SupervisorsView';
import StudentsView from '../../components/Groups/StudentsView';
import ResourceRenderer from '../../components/ResourceRenderer';

import { isReady, isLoading, hasFailed, getData, getJsData } from '../../redux/helpers/resourceManager';
import { createGroup, fetchSubgroups, fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchSupervisors, fetchStudents } from '../../redux/modules/users';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { usersSelector, isStudentOf, isSupervisorOf, isAdminOf } from '../../redux/selectors/users';

import {
  groupSelector,
  groupsSelectors,
  groupsAssignmentsSelector,
  studentsOfGroup,
  supervisorsOfGroup
} from '../../redux/selectors/groups';

import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

class Group extends Component {

  componentWillMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.group !== newProps.group) {
      this.loadData(newProps);
    }
  }

  loadData = ({
    params: { groupId },
    load,
    group,
    parentGroup,
    isSupervisor
  }) => {
    load.groupIfNeeded(groupId);
    load.statsIfNeeded();
    isReady(group) && !parentGroup && load.groupIfNeeded(group.getIn(['data', 'parentGroupId']));
    isReady(group) && load.instanceIfNeeded(group.getIn(['data', 'instanceId']));
    load.assignmentsIfNeeded();
    load.subgroups();
    load.supervisors();
    isSupervisor && load.students();
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
        link: INSTANCE_URI_FACTORY(getData(instance).get('id')),
        text: instance.getIn(['data', 'name'])
      });
    }

    if (parentGroup !== null && isReady(parentGroup)) {
      breadcrumbs.push({
        iconName: 'group',
        link: GROUP_URI_FACTORY(getData(parentGroup).get('id')),
        text: getData(parentGroup).get('name')
      });
    }

    // it doesn't make sense to add current group to the breadcrumbs
    // unless the instance or the parent group is loaded first
    if (breadcrumbs.length > 0 && isReady(group)) {
      breadcrumbs.push({
        iconName: 'group',
        text: getData(group).get('name')
      });
    }

    return breadcrumbs;
  };

  render() {
    const {
      group,
      userId,
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

    const groupData = getJsData(group);
    return (
      <PageContent
        title={this.getTitle(group)}
        description={<FormattedMessage id='app.group.description' defaultMessage='Group overview and assignments' />}
        breadcrumbs={this.getBreadcrumbs()}>
        <div>
          <ResourceRenderer
            loading={<LoadingGroupDetail />}
            failed={<FailedGroupDetail />}
            resource={group}>
            {data => (
              <div>
                <GroupDetail {...data} groups={groups} />
                {!isAdmin && !isSupervisor && (
                  <p className='text-center'>
                    <LeaveJoinGroupButtonContainer userId={userId} groupId={data.id} />
                  </p>
                )}
              </div>
            )}
          </ResourceRenderer>

          {isReady(group) && isAdmin && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.adminsView.title' defaultMessage='Administrator controls of {groupName}' values={{ groupName: groupData.name }} />
                </h3>
                <AdminsView
                  group={groupData}
                  supervisors={supervisors}
                  addSubgroup={addSubgroup(groupData.instanceId)} />
              </Col>
            </Row>
          )}

          {isReady(group) && isSupervisor && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.supervisorsView.title' defaultMessage="Supervisor's controls of {groupName}" values={{ groupName: groupData.name }} />
                </h3>
                <SupervisorsView
                  group={groupData}
                  stats={stats}
                  students={students} />
              </Col>
            </Row>
          )}

          {isReady(group) && isStudent && (
            <Row>
              <Col xs={12}>
                <h3>
                  <FormattedMessage id='app.group.studentsView.title' defaultMessage="Student's dashboard for {groupName}" values={{ groupName: groupData.name }} />
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
    const userId = loggedInUserIdSelector(state);
    const isStudent = isStudentOf(userId, groupId)(state);
    const isSupervisor = isSupervisorOf(userId, groupId)(state);
    const isAdmin = isAdminOf(userId, groupId)(state);
    const supervisorsIds = supervisorsOfGroup(groupId)(state);
    const studentsIds = (isSupervisor || isAdmin) ? studentsOfGroup(groupId)(state) : List();
    const readyUsers = usersSelector(state).toList().filter(isReady);
    const supervisors = readyUsers.filter(user => supervisorsIds.includes(getData(user).get('id'))).map(getJsData);
    const students = readyUsers.filter(isReady).filter(user => studentsIds.includes(getData(user).get('id'))).map(getJsData);

    return {
      group,
      userId,
      instance: isReady(group) ? instanceSelector(state, getData(group).get('instanceId')) : null,
      parentGroup: isReady(group) ? groupSelector(getData(group).get('parentGroupId'))(state) : null,
      groups: groupsSelectors(state),
      assignments: groupsAssignmentsSelector(groupId)(state),
      stats: createGroupsStatsSelector(groupId)(state),
      students,
      supervisors,
      isStudent,
      isSupervisor,
      isAdmin
    };
  },
  (dispatch, { params: { groupId } }) => ({
    addSubgroup: (instanceId) => ({ name, description }) => dispatch(createGroup({ instanceId, name, description, parentGroupId: groupId })),
    load: {
      instanceIfNeeded: (id) => dispatch(fetchInstanceIfNeeded(id)),
      groupIfNeeded: (id) => dispatch(fetchGroupIfNeeded(groupId)),
      statsIfNeeded: () => dispatch(fetchGroupsStatsIfNeeded(groupId)),
      assignmentsIfNeeded: () => dispatch(fetchAssignmentsForGroup(groupId)),
      subgroups: () => dispatch(fetchSubgroups(groupId)),
      supervisors: () => dispatch(fetchSupervisors(groupId)),
      students: () => dispatch(fetchStudents(groupId))
    }
  })
)(Group);
