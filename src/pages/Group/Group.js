import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import PageContent from '../../components/PageContent';

import GroupDetail, { LoadingGroupDetail, FailedGroupDetail } from '../../components/Groups/GroupDetail';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import AdminsView from '../../components/Groups/AdminsView';
import SupervisorsView from '../../components/Groups/SupervisorsView';
import StudentsView from '../../components/Groups/StudentsView';
import ResourceRenderer from '../../components/ResourceRenderer';

import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';
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

  static isMemberOf = (group, userId) =>
    group.admins.indexOf(userId) >= 0 ||
    group.supervisors.indexOf(userId) >= 0 ||
    group.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, userId) =>
    Promise.all([
      dispatch(fetchAssignmentsForGroup(groupId)),
      dispatch(fetchSubgroups(groupId)),
      dispatch(fetchGroupIfNeeded(groupId))
        .then((res) => res.value)
        .then(group => Promise.all([
          dispatch(fetchInstanceIfNeeded(group.instanceId)),
          Group.isMemberOf(group, userId)
            ? Promise.all([
              dispatch(fetchSupervisors(groupId)),
              dispatch(fetchStudents(groupId))
            ])
            : Promise.resolve(),
          group.parentGroupId
            ? dispatch(fetchGroupIfNeeded(group.parentGroupId))
            : Promise.resolve(),
          group.publicStats === true
            ? dispatch(fetchGroupsStatsIfNeeded(groupId))
            : Promise.resolve()
        ]))
    ]);

  componentWillMount() {
    const { loadAsync, userId } = this.props;
    loadAsync(userId);
  }

  componentWillReceiveProps(newProps) {
    const {
      params: { groupId },
      isAdmin,
      isSupervisor,
      isStudent
    } = this.props;

    if (groupId !== newProps.params.groupId || (
      !(isStudent || isSupervisor || isAdmin) &&
      (newProps.isStudent || newProps.isSupervisor || newProps.isAdmin)
    )) {
      newProps.loadAsync(newProps.userId);
    }
  }

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

    return (
      <PageContent
        title={(
          <ResourceRenderer resource={group}>
            {group => <span>{group.name}</span>}
          </ResourceRenderer>
        )}
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
                  addSubgroup={addSubgroup(data.instanceId)} />)}

              {isSupervisor && (
                <SupervisorsView
                  group={data}
                  stats={stats}
                  students={students}
                  statuses={statuses}
                  assignments={assignments} />)}

              {isStudent && (
                <StudentsView
                  group={data}
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

Group.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  parentGroup: ImmutablePropTypes.map,
  students: ImmutablePropTypes.list,
  supervisors: ImmutablePropTypes.list,
  assignments: ImmutablePropTypes.list,
  groups: ImmutablePropTypes.map,
  isStudent: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.array
};

const mapStateToProps = (
  state, { params: { groupId } }
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

const mapDispatchToProps = (dispatch, { params }) => ({
  addSubgroup: (instanceId) =>
    ({ name, description }) =>
      dispatch(createGroup({
        instanceId,
        name,
        description,
        parentGroupId: params.groupId
      })),
  loadAsync: (userId) => Group.loadAsync(params, dispatch, userId)
});

export default connect(mapStateToProps, mapDispatchToProps)(Group);
