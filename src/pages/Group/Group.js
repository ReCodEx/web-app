import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/AdminLTE/FlatButton';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import Page from '../../components/Page';
import GroupDetail, {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import LeaveJoinGroupButtonContainer
  from '../../containers/LeaveJoinGroupButtonContainer';
import AdminsView from '../../components/Groups/AdminsView';
import SupervisorsView from '../../components/Groups/SupervisorsView';
import StudentsView from '../../components/Groups/StudentsView';
import { EditIcon } from '../../components/Icons';

import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import {
  createGroup,
  fetchSubgroups,
  fetchGroupIfNeeded
} from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchSupervisors, fetchStudents } from '../../redux/modules/users';
import {
  fetchAssignmentsForGroup,
  create as assignExercise
} from '../../redux/modules/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  readyUsersDataSelector,
  isStudentOf,
  isSupervisorOf,
  isAdminOf
} from '../../redux/selectors/users';

import {
  groupSelector,
  groupsSelectors,
  groupsAssignmentsSelector,
  supervisorsOfGroup
} from '../../redux/selectors/groups';

import { getStatuses } from '../../redux/selectors/stats';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

import withLinks from '../../hoc/withLinks';

class Group extends Component {
  static isMemberOf = (group, userId) =>
    group.admins.indexOf(userId) >= 0 ||
    group.supervisors.indexOf(userId) >= 0 ||
    group.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, userId) =>
    Promise.all([
      dispatch(fetchGroupIfNeeded(groupId))
        .then(res => res.value)
        .then(group =>
          Promise.all([
            dispatch(fetchInstanceIfNeeded(group.instanceId)),
            Group.isMemberOf(group, userId)
              ? Promise.all([
                dispatch(fetchAssignmentsForGroup(groupId)),
                dispatch(fetchSupervisors(groupId)),
                dispatch(fetchStudents(groupId))
              ])
              : Promise.resolve(),
            group.parentGroupId
              ? Promise.all([
                dispatch(fetchGroupIfNeeded(group.parentGroupId)),
                dispatch(fetchSubgroups(group.parentGroupId))
              ])
              : dispatch(fetchSubgroups(group.id)),
            dispatch(fetchGroupsStatsIfNeeded(groupId))
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

    if (
      groupId !== newProps.params.groupId ||
      (!(isStudent || isSupervisor || isAdmin) &&
        (newProps.isStudent || newProps.isSupervisor || newProps.isAdmin))
    ) {
      newProps.loadAsync(newProps.userId);
    }
  }

  getBreadcrumbs = () => {
    const { group, instance, parentGroup } = this.props;
    const breadcrumbs = [
      {
        resource: instance,
        iconName: 'university',
        breadcrumb: data => ({
          link: ({ INSTANCE_URI_FACTORY }) => INSTANCE_URI_FACTORY(data.id),
          text: data.name,
          resource: instance
        })
      },
      {
        resource: parentGroup,
        iconName: 'group',
        hidden: parentGroup === null,
        breadcrumb: data => ({
          link: ({ GROUP_URI_FACTORY }) => GROUP_URI_FACTORY(data.id),
          text: data.name
        })
      },
      {
        resource: group,
        iconName: 'group',
        breadcrumb: data => ({
          text: data.name
        })
      }
    ];
    return breadcrumbs;
  };

  render() {
    const {
      group,
      userId,
      groups,
      students,
      supervisors = List(),
      allAssignments = List(),
      publicAssignments = List(),
      stats,
      statuses,
      isStudent,
      isAdmin,
      isSupervisor,
      addSubgroup,
      links: { GROUP_EDIT_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => group.name}
        description={
          <FormattedMessage
            id="app.group.description"
            defaultMessage="Group overview and assignments"
          />
        }
        breadcrumbs={this.getBreadcrumbs()}
        loading={<LoadingGroupDetail />}
        failed={<FailedGroupDetail />}
      >
        {data => (
          <div>
            {isAdmin &&
              <p>
                <LinkContainer to={GROUP_EDIT_URI_FACTORY(data.id)}>
                  <Button bsStyle="warning">
                    <EditIcon />
                    {' '}
                    <FormattedMessage
                      id="app.group.edit"
                      defaultMessage="Edit group settings"
                    />
                  </Button>
                </LinkContainer>
              </p>}

            <GroupDetail
              group={data}
              supervisors={supervisors}
              isAdmin={isAdmin}
              groups={groups}
            />

            {!isAdmin &&
              !isSupervisor &&
              data.isPublic &&
              <p className="text-center">
                <LeaveJoinGroupButtonContainer
                  userId={userId}
                  groupId={data.id}
                />
              </p>}

            {isAdmin &&
              <AdminsView
                group={data}
                supervisors={supervisors}
                addSubgroup={addSubgroup(data.instanceId)}
              />}

            {isSupervisor &&
              <SupervisorsView
                group={data}
                statuses={statuses}
                assignments={allAssignments}
              />}

            {isStudent &&
              <StudentsView
                group={data}
                students={students}
                stats={stats}
                statuses={statuses}
                assignments={publicAssignments}
              />}
          </div>
        )}
      </Page>
    );
  }
}

Group.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  parentGroup: ImmutablePropTypes.map,
  students: PropTypes.array,
  supervisors: PropTypes.array,
  allAssignments: ImmutablePropTypes.list,
  publicAssignments: ImmutablePropTypes.list,
  groups: ImmutablePropTypes.map,
  isStudent: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  assignExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const group = groupSelector(groupId)(state);
  const groupData = getJsData(group);
  const userId = loggedInUserIdSelector(state);
  const supervisorsIds = supervisorsOfGroup(groupId)(state);
  const readyUsers = readyUsersDataSelector(state);

  return {
    group,
    userId,
    instance: isReady(group)
      ? instanceSelector(state, groupData.instanceId)
      : null,
    parentGroup: isReady(group) && groupData.parentGroupId !== null
      ? groupSelector(groupData.parentGroupId)(state)
      : null,
    groups: groupsSelectors(state),
    publicAssignments: groupsAssignmentsSelector(groupId, 'public')(state),
    allAssignments: groupsAssignmentsSelector(groupId, 'all')(state),
    statuses: getStatuses(groupId, userId)(state),
    supervisors: readyUsers.filter(user => supervisorsIds.includes(user.id)),
    isStudent: isStudentOf(userId, groupId)(state),
    isSupervisor: isSupervisorOf(userId, groupId)(state),
    isAdmin: isAdminOf(userId, groupId)(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  addSubgroup: instanceId =>
    data =>
      dispatch(
        createGroup({
          ...data,
          instanceId,
          parentGroupId: params.groupId
        })
      ),
  loadAsync: userId => Group.loadAsync(params, dispatch, userId),
  assignExercise: exerciseId =>
    dispatch(assignExercise(params.groupId, exerciseId)),
  push: url => dispatch(push(url))
});

export default withLinks(connect(mapStateToProps, mapDispatchToProps)(Group));
