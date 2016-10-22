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

import { isReady, isLoading, hasFailed, getData, getJsData, getId } from '../../redux/helpers/resourceManager';
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

import { createGroupsStatsSelector, getStatuses } from '../../redux/selectors/stats';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

class Group extends Component {

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.group !== newProps.group) {
      newProps.loadAsync();
    }
  }

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
      statuses,
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
                </p>)}

              {isAdmin && (
                <AdminsView
                  group={data}
                  supervisors={supervisors}
                  addSubgroup={addSubgroup(groupData.instanceId)} />)}

              {isSupervisor && (
                <SupervisorsView
                  group={groupData}
                  stats={stats}
                  students={students} />)}

              {isStudent && (
                <StudentsView
                  group={groupData}
                  students={students}
                  stats={stats}
                  statuses={statuses}
                  assignments={assignments} />)}
            </div>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }
}

Group.contextTypes = {
  links: PropTypes.object
};

const mapStateToProps = (
  state,
  { params: { groupId } }
) => {
  const group = groupSelector(groupId)(state);
  const userId = loggedInUserIdSelector(state);
  const supervisorsIds = supervisorsOfGroup(groupId)(state);
  const studentsIds = studentsOfGroup(groupId)(state);
  const readyUsers = usersSelector(state).toList().filter(isReady);

  return {
    group,
    userId,
    instance: isReady(group) ? instanceSelector(state, getData(group).get('instanceId')) : null,
    parentGroup: isReady(group) ? groupSelector(getData(group).get('parentGroupId'))(state) : null,
    groups: groupsSelectors(state),
    assignments: groupsAssignmentsSelector(groupId)(state),
    stats: createGroupsStatsSelector(groupId)(state),
    statuses: getStatuses(groupId, userId)(state),
    students: readyUsers.filter(isReady).filter(user => studentsIds.includes(getId(user))).map(getJsData),
    supervisors: readyUsers.filter(user => supervisorsIds.includes(getId(user))).map(getJsData),
    isStudent: isStudentOf(userId, groupId)(state),
    isSupervisor: isSupervisorOf(userId, groupId)(state),
    isAdmin: isAdminOf(userId, groupId)(state)
  };
};

const mapDispatchToProps = (
  dispatch,
  {
    params: { groupId },
    isStudent,
    isSupervisor,
    isAdmin
  }
) => ({
  addSubgroup: (instanceId) =>
    ({ name, description }) =>
      dispatch(createGroup({ instanceId, name, description, parentGroupId: groupId })),
  loadAsync: () => Promise.all([
    dispatch(fetchAssignmentsForGroup(groupId)),
    dispatch(fetchSubgroups(groupId)),
    dispatch(fetchSupervisors(groupId)),
    isAdmin || isSupervisor
      ? Promise.all([
        dispatch(fetchGroupsStatsIfNeeded(groupId)),
        dispatch(fetchStudents(groupId))
      ])
      : Promise.resolve(),
    dispatch(fetchGroupIfNeeded(groupId))
      .then((res) => res.value)
      .then(group => Promise.all([
        dispatch(fetchInstanceIfNeeded(group.instanceId)),
        group.parentGroupId
          ? dispatch(fetchGroupIfNeeded(group.parentGroupId))
          : Promise.resolve(),
        isStudent
          ? Promise.all([
            dispatch(fetchStudents(groupId)),
            group.publicStats
              ? fetchGroupsStatsIfNeeded(groupId)
              : Promise.resolve()
          ])
          : Promise.resolve()
      ]))
  ])
});

export default connect(mapStateToProps, mapDispatchToProps)(Group);
