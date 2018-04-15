import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { FormattedMessage, injectIntl } from 'react-intl';
import { List, Map } from 'immutable';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import { AddIcon, EditIcon } from '../../components/icons';
import { LocalizedGroupName } from '../../components/helpers/LocalizedNames';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AddStudent from '../../components/Groups/AddStudent';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import ExercisesSimpleList from '../../components/Exercises/ExercisesSimpleList';
import AssignExerciseButton from '../../components/buttons/AssignExerciseButton';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStats } from '../../redux/modules/stats';
import { fetchStudents } from '../../redux/modules/users';
import {
  fetchAssignmentsForGroup,
  create as assignExercise
} from '../../redux/modules/assignments';
import {
  fetchGroupExercises,
  create as createExercise
} from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSupervisorOf,
  isAdminOf,
  isLoggedAsSuperAdmin,
  studentsOfGroupSelector,
  isStudentOf
} from '../../redux/selectors/users';
import {
  groupSelector,
  groupsSelector,
  groupsPublicAssignmentsSelector,
  groupsAllAssignmentsSelector
} from '../../redux/selectors/groups';
import { getExercisesForGroup } from '../../redux/selectors/exercises';
import {
  getStatusesForLoggedUser,
  createGroupsStatsSelector
} from '../../redux/selectors/stats';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';

import { getLocalizedName } from '../../helpers/getLocalizedData';
import withLinks from '../../helpers/withLinks';
import { isReady } from '../../redux/helpers/resourceManager/index';
import ResultsTable from '../../components/Groups/ResultsTable/ResultsTable';
import GroupTopButtons from '../../components/Groups/GroupTopButtons/GroupTopButtons';

class GroupDetail extends Component {
  static isAdminOrSupervisorOf = (group, userId) =>
    group.privateData.admins.indexOf(userId) >= 0 ||
    group.privateData.supervisors.indexOf(userId) >= 0;

  static isMemberOf = (group, userId) =>
    GroupDetail.isAdminOrSupervisorOf(group, userId) ||
    group.privateData.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, userId, isSuperAdmin) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        Promise.all([
          GroupDetail.isAdminOrSupervisorOf(group, userId) || isSuperAdmin
            ? dispatch(fetchGroupExercises(groupId))
            : Promise.resolve(),
          GroupDetail.isMemberOf(group, userId) || isSuperAdmin
            ? Promise.all([
                dispatch(fetchAssignmentsForGroup(groupId)),
                dispatch(fetchStudents(groupId)),
                dispatch(fetchGroupsStats(groupId))
              ])
            : Promise.resolve()
        ])
      )
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
        iconName: 'users',
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
    const {
      assignExercise,
      push,
      links: { ASSIGNMENT_EDIT_URI_FACTORY }
    } = this.props;
    assignExercise(exerciseId).then(({ value: assigment }) =>
      push(ASSIGNMENT_EDIT_URI_FACTORY(assigment.id))
    );
  };

  render() {
    const {
      group,
      students,
      allAssignments = List(),
      groupExercises = Map(),
      publicAssignments = List(),
      assignmentEnvironmentsSelector,
      stats,
      statuses,
      isAdmin,
      isSuperAdmin,
      isSupervisor,
      isStudent,
      userId,
      links: {
        EXERCISE_EDIT_URI_FACTORY,
        EXERCISE_EDIT_LIMITS_URI_FACTORY,
        EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY
      }
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

            <GroupTopButtons
              group={data}
              userId={userId}
              canEdit={isAdmin || isSuperAdmin}
              canSeeDetail={
                isAdmin ||
                isSuperAdmin ||
                data.privateData.students.includes(userId)
              }
              canLeaveJoin={
                !isAdmin &&
                !isSupervisor &&
                (data.privateData.isPublic || isStudent)
              }
            />
            {data.organizational &&
              <Row>
                <Col lg={12}>
                  <p className="callout callout-info">
                    <FormattedMessage
                      id="app.group.organizationalExplain"
                      defaultMessage="This group is organizational, so it cannot have any students nor assignments. However, it may have attached exercises which can be assigned in sub-groups."
                    />
                  </p>
                </Col>
              </Row>}

            {!data.organizational &&
              <Row>
                <Col lg={12}>
                  <Box
                    title={
                      <FormattedMessage
                        id="app.studentsView.assignments"
                        defaultMessage="Assignments"
                      />
                    }
                    noPadding
                    unlimitedHeight
                  >
                    <ResourceRenderer resource={stats}>
                      {groupStats =>
                        <AssignmentsTable
                          assignments={
                            isAdmin || isSupervisor
                              ? allAssignments
                              : publicAssignments
                          }
                          assignmentEnvironmentsSelector={
                            assignmentEnvironmentsSelector
                          }
                          showGroup={false}
                          statuses={statuses}
                          stats={groupStats.find(
                            item => item.userId === userId
                          )}
                          isAdmin={isAdmin || isSupervisor}
                        />}
                    </ResourceRenderer>
                  </Box>
                </Col>
              </Row>}

            {!data.organizational &&
              <Row>
                <Col lg={12}>
                  <Box
                    title={
                      <FormattedMessage
                        id="app.groupDetail.studentsResultsTable"
                        defaultMessage="Students and Their Results"
                      />
                    }
                    unlimitedHeight
                    noPadding
                  >
                    <ResourceRenderer resource={[stats, ...publicAssignments]}>
                      {(groupStats, ...pubAssignments) =>
                        <ResultsTable
                          users={students}
                          assignments={pubAssignments}
                          stats={groupStats}
                          isAdmin={isAdmin}
                          renderActions={id =>
                            <LeaveJoinGroupButtonContainer
                              userId={id}
                              groupId={data.id}
                            />}
                        />}
                    </ResourceRenderer>
                  </Box>
                </Col>
              </Row>}

            {(isSupervisor || isAdmin) &&
              !data.organizational &&
              <Row>
                <Col sm={6}>
                  <Box
                    title={
                      <FormattedMessage
                        id="app.group.spervisorsView.addStudent"
                        defaultMessage="Add Student"
                      />
                    }
                    isOpen
                  >
                    <AddStudent
                      instanceId={data.privateData.instanceId}
                      groupId={data.id}
                    />
                  </Box>
                </Col>
              </Row>}

            {(isSupervisor || isAdmin) &&
              <Row>
                <Col lg={12}>
                  <Box
                    title={
                      <FormattedMessage
                        id="app.group.spervisorsView.groupExercises"
                        defaultMessage="Group Exercises"
                      />
                    }
                    footer={
                      <p className="text-center">
                        <Button
                          bsStyle="success"
                          className="btn-flat"
                          bsSize="sm"
                          onClick={this.createGroupExercise}
                        >
                          <AddIcon />{' '}
                          <FormattedMessage
                            id="app.group.createExercise"
                            defaultMessage="Add group exercise"
                          />
                        </Button>
                      </p>
                    }
                    isOpen
                  >
                    <ResourceRenderer resource={groupExercises.toArray()}>
                      {(...exercises) =>
                        <ExercisesSimpleList
                          exercises={exercises}
                          createActions={(exerciseId, isLocked, isBroken) =>
                            <div>
                              <AssignExerciseButton
                                isLocked={isLocked}
                                isBroken={isBroken}
                                assignExercise={() =>
                                  this.assignExercise(exerciseId)}
                              />

                              <LinkContainer
                                to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}
                              >
                                <Button bsSize="xs" bsStyle="warning">
                                  <EditIcon />{' '}
                                  <FormattedMessage
                                    id="app.exercises.listEdit"
                                    defaultMessage="Settings"
                                  />
                                </Button>
                              </LinkContainer>
                              <LinkContainer
                                to={EXERCISE_EDIT_SIMPLE_CONFIG_URI_FACTORY(
                                  exerciseId
                                )}
                              >
                                <Button bsSize="xs" bsStyle="warning">
                                  <EditIcon />{' '}
                                  <FormattedMessage
                                    id="app.exercises.listEditConfig"
                                    defaultMessage="Configuration"
                                  />
                                </Button>
                              </LinkContainer>
                              <LinkContainer
                                to={EXERCISE_EDIT_LIMITS_URI_FACTORY(
                                  exerciseId
                                )}
                              >
                                <Button bsSize="xs" bsStyle="warning">
                                  <EditIcon />{' '}
                                  <FormattedMessage
                                    id="app.exercises.listEditLimits"
                                    defaultMessage="Limits"
                                  />
                                </Button>
                              </LinkContainer>

                              <DeleteExerciseButtonContainer
                                id={exerciseId}
                                bsSize="xs"
                              />
                            </div>}
                        />}
                    </ResourceRenderer>
                  </Box>
                </Col>
              </Row>}
          </div>}
      </Page>
    );
  }
}

GroupDetail.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  allAssignments: ImmutablePropTypes.list,
  groupExercises: ImmutablePropTypes.map,
  publicAssignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  groups: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  isStudent: PropTypes.bool,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  assignExercise: PropTypes.func.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(groupId)(state),
    userId,
    groups: groupsSelector(state),
    publicAssignments: groupsPublicAssignmentsSelector(state, groupId),
    assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
    allAssignments: groupsAllAssignmentsSelector(state, groupId),
    groupExercises: getExercisesForGroup(state, groupId),
    statuses: getStatusesForLoggedUser(state, groupId),
    stats: createGroupsStatsSelector(groupId)(state),
    students: studentsOfGroupSelector(state, groupId),
    isSupervisor: isSupervisorOf(userId, groupId)(state),
    isAdmin: isAdminOf(userId, groupId)(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    isStudent: isStudentOf(userId, groupId)(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: (userId, isSuperAdmin) =>
    GroupDetail.loadAsync(params, dispatch, userId, isSuperAdmin),
  assignExercise: exerciseId =>
    dispatch(assignExercise(params.groupId, exerciseId)),
  createGroupExercise: () =>
    dispatch(createExercise({ groupId: params.groupId })),
  push: url => dispatch(push(url))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(GroupDetail))
);
