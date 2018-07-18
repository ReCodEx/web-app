import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Button from '../../components/widgets/FlatButton';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import {
  LoadingGroupDetail,
  FailedGroupDetail
} from '../../components/Groups/GroupDetail';
import HierarchyLine from '../../components/Groups/HierarchyLine';
import { AddIcon } from '../../components/icons';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AddStudent from '../../components/Groups/AddStudent';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import ExercisesListContainer from '../../containers/ExercisesListContainer';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStats } from '../../redux/modules/stats';
import { fetchStudents } from '../../redux/modules/users';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
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
  isStudentOf,
  loggedInUserSelector
} from '../../redux/selectors/users';
import {
  groupSelector,
  groupsSelector,
  groupsAssignmentsSelector
} from '../../redux/selectors/groups';
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

import { EMPTY_LIST } from '../../helpers/common';

class GroupDetail extends Component {
  static isAdminOrSupervisorOf = (group, userId) =>
    group.privateData.admins.indexOf(userId) >= 0 ||
    group.privateData.supervisors.indexOf(userId) >= 0;

  static isMemberOf = (group, userId) =>
    GroupDetail.isAdminOrSupervisorOf(group, userId) ||
    group.privateData.students.indexOf(userId) >= 0;

  static loadAsync = ({ groupId }, dispatch, { userId, isSuperAdmin }) =>
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

  render() {
    const {
      group,
      students,
      loggedUser,
      assignments = EMPTY_LIST,
      assignmentEnvironmentsSelector,
      stats,
      statuses,
      isAdmin,
      isSuperAdmin,
      isSupervisor,
      isStudent,
      userId,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={group}
        title={group => getLocalizedName(group, locale)}
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
                !isAdmin && !isSupervisor && (data.public || isStudent)
              }
              students={
                (isAdmin || isSuperAdmin) && !data.organizational
                  ? students
                  : null
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
                    <ResourceRenderer resource={stats} bulkyLoading>
                      {groupStats =>
                        <AssignmentsTable
                          assignments={assignments}
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
                    <ResourceRenderer
                      resource={[stats, loggedUser, ...assignments]}
                      bulkyLoading
                    >
                      {(groupStats, loggedUser, ...assignments) =>
                        <ResultsTable
                          users={students}
                          loggedUser={loggedUser}
                          assignments={assignments}
                          stats={groupStats}
                          publicStats={
                            data &&
                            data.privateData &&
                            data.privateData.publicStats
                          }
                          isAdmin={isAdmin}
                          isSupervisor={isSupervisor}
                          groupName={getLocalizedName(data, locale)}
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
                          <AddIcon gapRight />
                          <FormattedMessage
                            id="app.group.createExercise"
                            defaultMessage="Create Exercise in Group"
                          />
                        </Button>
                      </p>
                    }
                    isOpen
                  >
                    <ExercisesListContainer
                      id={`exercises-group-${data.id}`}
                      rootGroup={data.id}
                      showAssignButton={!data.organizational}
                    />
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
  loggedUser: PropTypes.object,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  assignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  groups: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  isStudent: PropTypes.bool,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  createGroupExercise: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object,
  intl: intlShape
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(groupId)(state),
    userId,
    loggedUser: loggedInUserSelector(state),
    groups: groupsSelector(state),
    assignments: groupsAssignmentsSelector(state, groupId),
    assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
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
    GroupDetail.loadAsync(params, dispatch, { userId, isSuperAdmin }),
  createGroupExercise: () =>
    dispatch(createExercise({ groupId: params.groupId })),
  push: url => dispatch(push(url))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(GroupDetail))
);
