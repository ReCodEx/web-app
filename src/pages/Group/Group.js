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

import {
  createGroup,
  fetchGroupIfNeeded,
  fetchInstanceGroups,
  fetchSubgroups
} from '../../redux/modules/groups';
import { fetchGroupsStats } from '../../redux/modules/stats';
import { fetchSupervisors, fetchStudents } from '../../redux/modules/users';
import {
  fetchAssignmentsForGroup,
  create as assignExercise
} from '../../redux/modules/assignments';
import {
  fetchGroupExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isStudentOf,
  isSupervisorOf,
  isAdminOf,
  isLoggedAsSuperAdmin,
  supervisorsOfGroupSelector,
  studentsOfGroupSelector
} from '../../redux/selectors/users';

import {
  groupSelector,
  groupsSelector,
  groupsPublicAssignmentsSelector,
  groupsAllAssignmentsSelector
} from '../../redux/selectors/groups';
import { getExercisesForGroup } from '../../redux/selectors/exercises';

import { getStatusesForLoggedUser } from '../../redux/selectors/stats';

import { getLocalizedName } from '../../helpers/getLocalizedData';
import withLinks from '../../helpers/withLinks';
import { isReady } from '../../redux/helpers/resourceManager/index';
import { fetchBestSubmission } from '../../redux/modules/groupResults';
import { getBestSubmissionsForLoggedInUser } from '../../redux/selectors/groupResults';

class Group extends Component {
  static isAdminOrSupervisorOf = (group, userId) =>
    group.privateData.admins.indexOf(userId) >= 0 ||
    group.privateData.supervisors.indexOf(userId) >= 0;

  static isMemberOf = (group, userId) =>
    Group.isAdminOrSupervisorOf(group, userId) ||
    group.privateData.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, userId, isSuperAdmin) =>
    Promise.all([
      dispatch(fetchGroupIfNeeded(groupId))
        .then(res => res.value)
        .then(group =>
          Promise.all([
            dispatch(fetchSupervisors(groupId)),
            dispatch(fetchInstanceGroups(group.privateData.instanceId)),
            Group.isAdminOrSupervisorOf(group, userId) || isSuperAdmin
              ? Promise.all([dispatch(fetchGroupExercises(groupId))])
              : Promise.resolve(),
            Group.isMemberOf(group, userId) || isSuperAdmin
              ? Promise.all([
                  dispatch(fetchAssignmentsForGroup(groupId)),
                  dispatch(fetchStudents(groupId)),
                  dispatch(fetchGroupsStats(groupId))
                ])
              : Promise.resolve(),
            group.privateData.students.indexOf(userId) >= 0
              ? Promise.all(
                  group.privateData.assignments.all.map(assignmentId =>
                    dispatch(fetchBestSubmission(userId, assignmentId))
                  )
                )
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
    const { params: { groupId }, userId, isSuperAdmin } = this.props;

    if (
      groupId !== newProps.params.groupId ||
      userId !== newProps.userId ||
      isSuperAdmin !== newProps.isSuperAdmin
    ) {
      newProps.loadAsync(newProps.userId, newProps.isSuperAdmin);
      return;
    }

    if (isReady(this.props.group) && isReady(newProps.group)) {
      const thisData = this.props.group.toJS().data.privateData;
      const newData = newProps.group.toJS().data.privateData;
      if (thisData.supervisors.length !== newData.supervisors.length) {
        newProps.refetchSupervisors();
      }
      if (thisData.students.length !== newData.students.length) {
        newProps.loadAsync(newProps.userId, newProps.isSuperAdmin);
      }
    }
  }

  getBreadcrumbs = () => {
    const { group, intl: { locale } } = this.props;
    const breadcrumbs = [
      {
        resource: group,
        iconName: 'university',
        breadcrumb: data => ({
          link: ({ INSTANCE_URI_FACTORY }) =>
            INSTANCE_URI_FACTORY(data.privateData.instanceId),
          text: 'Instance'
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
      students,
      supervisors = List(),
      allAssignments = List(),
      groupExercises = Map(),
      publicAssignments = List(),
      stats,
      statuses,
      bestSubmissions,
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
                bestSubmissions={bestSubmissions}
                isAdmin={isAdmin || isSuperAdmin}
                users={students}
              />}

            <GroupDetail
              group={data}
              supervisors={supervisors}
              isAdmin={isAdmin || isSuperAdmin}
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

            {(isAdmin || isSuperAdmin) &&
              <AdminsView
                group={data}
                supervisors={supervisors}
                addSubgroup={addSubgroup(data.privateData.instanceId)}
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
  isStudent: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  addSubgroup: PropTypes.func,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  bestSubmissions: PropTypes.object,
  assignExercise: PropTypes.func.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  refetchSupervisors: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

Group.contextTypes = {
  links: PropTypes.object
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(groupId)(state),
    userId,
    groups: groupsSelector(state),
    publicAssignments: groupsPublicAssignmentsSelector(state, groupId),
    allAssignments: groupsAllAssignmentsSelector(state, groupId),
    groupExercises: getExercisesForGroup(state, groupId),
    statuses: getStatusesForLoggedUser(state, groupId),
    bestSubmissions: getBestSubmissionsForLoggedInUser(state),
    supervisors: supervisorsOfGroupSelector(state, groupId),
    students: studentsOfGroupSelector(state, groupId),
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
  push: url => dispatch(push(url)),
  refetchSupervisors: () => dispatch(fetchSupervisors(params.groupId))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(Group))
);
