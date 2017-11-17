import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { FormattedMessage, injectIntl } from 'react-intl';
import { List, Map } from 'immutable';

import Page from '../../components/layout/Page';
import GroupDetail, {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import AdminsView from '../../components/Groups/AdminsView';
import SupervisorsView from '../../components/Groups/SupervisorsView';
import StudentsView from '../../components/Groups/StudentsView';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import { EditIcon } from '../../components/icons';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';

import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import {
  createGroup,
  fetchGroupIfNeeded,
  fetchInstanceGroupsIfNeeded,
  fetchSubgroups
} from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchSupervisors, fetchStudents } from '../../redux/modules/users';
import {
  fetchAssignmentsForGroup,
  create as assignExercise
} from '../../redux/modules/assignments';
import {
  fetchGroupExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import { fetchInstancePublicGroups } from '../../redux/modules/publicGroups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  readyUsersDataSelector,
  isStudentOf,
  isSupervisorOf,
  isAdminOf,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';

import {
  groupSelector,
  groupsSelector,
  groupsAssignmentsSelector,
  supervisorsOfGroup,
  studentsOfGroup
} from '../../redux/selectors/groups';
import { getExercisesByIdsSelector } from '../../redux/selectors/exercises';
import { publicGroupsSelectors } from '../../redux/selectors/publicGroups';

import { getStatuses } from '../../redux/selectors/stats';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector } from '../../redux/selectors/instances';

import { getLocalizedName } from '../../helpers/getLocalizedData';
import withLinks from '../../hoc/withLinks';

class Group extends Component {
  static isAdminOrSupervisorOf = (group, userId) =>
    group.admins.indexOf(userId) >= 0 || group.supervisors.indexOf(userId) >= 0;

  static isMemberOf = (group, userId) =>
    Group.isAdminOrSupervisorOf(group, userId) ||
    group.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, userId, isSuperAdmin) =>
    Promise.all([
      dispatch(fetchGroupIfNeeded(groupId)).then(res => res.value).then(group =>
        Promise.all([
          dispatch(fetchInstanceIfNeeded(group.instanceId)),
          dispatch(fetchSupervisors(groupId)),
          dispatch(fetchInstancePublicGroups(group.instanceId)),
          Group.isAdminOrSupervisorOf(group, userId) || isSuperAdmin
            ? Promise.all([
                dispatch(fetchInstanceGroupsIfNeeded(group.instanceId)), // for group traversal finding group exercises
                dispatch(fetchGroupExercises(groupId))
              ])
            : Promise.resolve(),
          Group.isMemberOf(group, userId) || isSuperAdmin
            ? Promise.all([
                dispatch(fetchAssignmentsForGroup(groupId)),
                dispatch(fetchStudents(groupId)),
                dispatch(fetchGroupsStatsIfNeeded(groupId))
              ])
            : Promise.resolve()
        ])
      ),
      dispatch(fetchSubgroups(groupId))
    ]);

  componentWillMount() {
    const { loadAsync, userId, isSuperAdmin } = this.props;
    loadAsync(userId, isSuperAdmin);
  }

  componentWillReceiveProps(newProps) {
    const {
      params: { groupId },
      isAdmin,
      isSupervisor,
      isStudent,
      isSuperAdmin
    } = this.props;

    if (
      groupId !== newProps.params.groupId ||
      (!(isStudent || isSupervisor || isAdmin || isSuperAdmin) &&
        (newProps.isStudent ||
          newProps.isSupervisor ||
          newProps.isAdmin ||
          newProps.isSuperAdmin))
    ) {
      newProps.loadAsync(newProps.userId, newProps.isSuperAdmin);
    }
  }

  getBreadcrumbs = () => {
    const { group, instance, intl: { locale } } = this.props;
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
        resource: group,
        iconName: 'group',
        breadcrumb: data => ({
          text: getLocalizedName(data, locale)
        })
      }
    ];
    return breadcrumbs;
  };

  createGroupExercise = () => {
    const {
      createGroupExercise,
      push,
      links: { EXERCISE_EDIT_URI_FACTORY }
    } = this.props;
    createGroupExercise().then(({ value: exercise }) =>
      push(EXERCISE_EDIT_URI_FACTORY(exercise.id))
    );
  };

  assignExercise = exerciseId => {
    const { assignExercise, push } = this.props;
    const { links: { ASSIGNMENT_EDIT_URI_FACTORY } } = this.context;
    assignExercise(exerciseId).then(({ value: assigment }) =>
      push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id))
    );
  };

  render() {
    const {
      group,
      userId,
      groups,
      publicGroups,
      students,
      supervisors = List(),
      allAssignments = List(),
      groupExercises = Map(),
      publicAssignments = List(),
      stats,
      statuses,
      isStudent,
      isAdmin,
      isSuperAdmin,
      isSupervisor,
      addSubgroup,
      links: { GROUP_EDIT_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => <LocalizedGroupName entity={group} />}
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
        {data =>
          <div>
            <HierarchyLine
              groupId={data.id}
              parentGroupsIds={data.parentGroupsIds}
            />
            <p />
            {(isAdmin || isSuperAdmin) &&
              <p>
                <LinkContainer to={GROUP_EDIT_URI_FACTORY(data.id)}>
                  <Button bsStyle="warning">
                    <EditIcon />{' '}
                    <FormattedMessage
                      id="app.group.edit"
                      defaultMessage="Edit group settings"
                    />
                  </Button>
                </LinkContainer>
              </p>}

            {(isStudent || isSupervisor || isAdmin || isSuperAdmin) &&
              <StudentsView
                group={data}
                stats={stats}
                statuses={statuses}
                assignments={publicAssignments}
                isAdmin={isAdmin || isSuperAdmin}
              />}

            <GroupDetail
              group={data}
              supervisors={supervisors}
              isAdmin={isAdmin || isSuperAdmin}
              groups={groups}
              publicGroups={publicGroups}
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

            {(isAdmin || isSuperAdmin) &&
              <AdminsView
                group={data}
                supervisors={supervisors}
                addSubgroup={addSubgroup(data.instanceId)}
              />}

            {(isAdmin || isSuperAdmin || isSupervisor) &&
              <SupervisorsView
                group={data}
                statuses={statuses}
                assignments={allAssignments}
                exercises={groupExercises}
                createGroupExercise={this.createGroupExercise}
                assignExercise={id => this.assignExercise(id)}
                users={students}
                publicAssignments={publicAssignments}
              />}
          </div>}
      </Page>
    );
  }
}

Group.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  supervisors: PropTypes.array,
  allAssignments: ImmutablePropTypes.list,
  groupExercises: ImmutablePropTypes.map,
  publicAssignments: ImmutablePropTypes.list,
  groups: ImmutablePropTypes.map,
  publicGroups: ImmutablePropTypes.map,
  isStudent: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  assignExercise: PropTypes.func.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

Group.contextTypes = {
  links: PropTypes.object
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const group = groupSelector(groupId)(state);
  const groupData = getJsData(group);
  const userId = loggedInUserIdSelector(state);
  const supervisorsIds = supervisorsOfGroup(groupId)(state);
  const studentsIds = studentsOfGroup(groupId)(state);
  const readyUsers = readyUsersDataSelector(state);
  const groupExercisesIds = state.groupExercises[groupId]
    ? state.groupExercises[groupId]
    : [];

  return {
    group,
    userId,
    instance: isReady(group)
      ? instanceSelector(state, groupData.instanceId)
      : null,
    groups: groupsSelector(state),
    publicGroups: publicGroupsSelectors(state),
    publicAssignments: groupsAssignmentsSelector(groupId, 'public')(state),
    allAssignments: groupsAssignmentsSelector(groupId, 'all')(state),
    groupExercises: getExercisesByIdsSelector(groupExercisesIds)(state),
    statuses: getStatuses(groupId, userId)(state),
    supervisors: readyUsers.filter(user => supervisorsIds.includes(user.id)),
    students: readyUsers.filter(user => studentsIds.includes(user.id)),
    isStudent: isStudentOf(userId, groupId)(state),
    isSupervisor: isSupervisorOf(userId, groupId)(state),
    isAdmin: isAdminOf(userId, groupId)(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  addSubgroup: instanceId => data =>
    dispatch(
      createGroup({
        ...data,
        instanceId,
        parentGroupId: params.groupId
      })
    ),
  loadAsync: (userId, isSuperAdmin) =>
    Group.loadAsync(params, dispatch, userId, isSuperAdmin),
  assignExercise: exerciseId =>
    dispatch(assignExercise(params.groupId, exerciseId)),
  createGroupExercise: () =>
    dispatch(createExercise({ groupId: params.groupId })),
  push: url => dispatch(push(url))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(Group))
);
