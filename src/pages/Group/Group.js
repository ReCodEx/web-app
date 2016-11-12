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

  static loadAsync = (
    { groupId },
    dispatch
  ) => Promise.all([
    dispatch(fetchAssignmentsForGroup(groupId)),
    dispatch(fetchSubgroups(groupId)),
    dispatch(fetchSupervisors(groupId)),
    dispatch(fetchStudents(groupId)),
    dispatch(fetchGroupIfNeeded(groupId))
      .then((res) => res.value)
      .then(group => Promise.all([
        dispatch(fetchInstanceIfNeeded(group.instanceId)),
        group.parentGroupId
          ? dispatch(fetchGroupIfNeeded(group.parentGroupId))
          : Promise.resolve(),
        group.publicStats === true
          ? dispatch(fetchGroupsStatsIfNeeded(groupId))
          : Promise.resolve()
      ]))
  ])

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
    const breadcrumbs = [{
      resource: instance,
      iconName: 'university',
      breadcrumb: (data) => ({
        link: ({ INSTANCE_URI_FACTORY }) => INSTANCE_URI_FACTORY(data.id),
        text: data.name,
        resource: instance
      })
    }, {
      resource: parentGroup,
      iconName: 'group',
      hidden: parentGroup === null,
      breadcrumb: (data) => ({
        link: ({ GROUP_URI_FACTORY }) => GROUP_URI_FACTORY(data.id),
        text: data.name
      })
    }, {
      resource: group,
      iconName: 'group',
      breadcrumb: (data) => ({
        text: data.name
      })
    }];
    return breadcrumbs;
  };

  render() {
    const {
      group,
      userId,
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
                  students={students}
                  assignments={assignments} />)}

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

const mapStateToProps = (
  state,
  { params: { groupId } }
) => {
  const group = groupSelector(groupId)(state);
  const groupData = getJsData(group);
  const userId = loggedInUserIdSelector(state);
  const supervisorsIds = supervisorsOfGroup(groupId)(state);
  const studentsIds = studentsOfGroup(groupId)(state);
  const readyUsers = usersSelector(state).toList().filter(isReady);

  return {
    group,
    userId,
    instance: isReady(group) ? instanceSelector(state, groupData.instanceId) : null,
    parentGroup: isReady(group) && groupData.parentGroupId !== null
      ? groupSelector(groupData.parentGroupId)(state)
      : null,
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
    params,
    isStudent,
    isSupervisor,
    isAdmin
  }
) => ({
  addSubgroup: (instanceId) => ({ name, description }) =>
    dispatch(createGroup({
      instanceId,
      name,
      description,
      parentGroupId: params.groupId
    })),
  loadAsync: () => Group.loadAsync(params, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Group);
