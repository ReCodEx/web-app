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
import { AddIcon, BanIcon } from '../../components/icons';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AddStudent from '../../components/Groups/AddStudent';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import ExercisesListContainer from '../../containers/ExercisesListContainer';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupsStats } from '../../redux/modules/stats';
import { fetchStudents } from '../../redux/modules/users';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { create as createExercise } from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  isSupervisorOf,
  isAdminOf,
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

import {
  isSupervisorRole,
  isStudentRole
} from '../../components/helpers/usersRoles';
import {
  EMPTY_LIST,
  hasPermissions,
  hasOneOfPermissions
} from '../../helpers/common';

class GroupDetail extends Component {
  static loadAsync = ({ groupId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        Promise.all([
          hasPermissions(group, 'viewAssignments')
            ? dispatch(fetchAssignmentsForGroup(groupId))
            : Promise.resolve(),
          hasPermissions(group, 'viewStudents')
            ? dispatch(fetchStudents(groupId))
            : Promise.resolve(),
          hasPermissions(group, 'viewStats')
            ? dispatch(fetchGroupsStats(groupId))
            : Promise.resolve()
        ])
      )
    ]);

  componentWillMount() {
    const { loadAsync } = this.props;
    loadAsync();
  }

  componentWillReceiveProps(newProps) {
    const { params: { groupId } } = this.props;

    if (groupId !== newProps.params.groupId) {
      newProps.loadAsync();
      return;
    }

    if (
      isReady(this.props.group) &&
      isReady(newProps.group) &&
      this.props.group.hasIn(['data', 'privateData', 'students']) &&
      newProps.group.hasIn(['data', 'privateData', 'students'])
    ) {
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
        breadcrumb: data =>
          data &&
          data.privateData && {
            link: ({ INSTANCE_URI_FACTORY }) =>
              INSTANCE_URI_FACTORY(data.privateData.instanceId),
            text: 'Instance'
          }
      },
      {
        resource: group,
        iconName: 'users',
        breadcrumb: data =>
          data &&
          data.privateData && {
            text: getLocalizedName(data, locale)
          }
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
      isGroupAdmin,
      isGroupSupervisor,
      isGroupStudent,
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
              canLeaveJoin={
                !isGroupAdmin &&
                !isGroupSupervisor &&
                (data.public || isGroupStudent)
              }
              students={students}
            />
            {!hasOneOfPermissions(data, 'viewAssignments', 'viewExercises') &&
              <Row>
                <Col sm={12}>
                  <p className="callout callout-warning larger">
                    <BanIcon gapRight />
                    <FormattedMessage
                      id="generic.accessDenied"
                      defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                    />
                  </p>
                </Col>
              </Row>}

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
              hasPermissions(data, 'viewAssignments') &&
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
                          isGroupAdmin={isGroupAdmin || isGroupSupervisor}
                        />}
                    </ResourceRenderer>
                  </Box>
                </Col>
              </Row>}

            <ResourceRenderer resource={loggedUser}>
              {loggedUser =>
                <React.Fragment>
                  {!data.organizational &&
                    hasPermissions(data, 'viewAssignments', 'viewStudents') &&
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
                            resource={[stats, ...assignments]}
                            bulkyLoading
                          >
                            {(groupStats, ...assignments) =>
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
                                isAdmin={isGroupAdmin}
                                isSupervisor={isGroupSupervisor}
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

                  {// unfortunatelly, this cannot be covered by permission hints at the moment, since addStudent involes both student and group
                  (isGroupSupervisor || isGroupAdmin) &&
                    !data.organizational &&
                    isSupervisorRole(loggedUser.privateData.role) &&
                    !isStudentRole(loggedUser.privateData.role) &&
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
                </React.Fragment>}
            </ResourceRenderer>

            {hasPermissions(data, 'viewExercises') &&
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
                      hasPermissions(data, 'createExercise') &&
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
                    unlimitedHeight
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
  loggedUser: ImmutablePropTypes.map,
  group: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  assignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  groups: ImmutablePropTypes.map,
  isGroupAdmin: PropTypes.bool,
  isGroupSupervisor: PropTypes.bool,
  isGroupStudent: PropTypes.bool,
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
    isGroupSupervisor: isSupervisorOf(userId, groupId)(state),
    isGroupAdmin: isAdminOf(userId, groupId)(state),
    isGroupStudent: isStudentOf(userId, groupId)(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: () => GroupDetail.loadAsync(params, dispatch),
  createGroupExercise: () =>
    dispatch(createExercise({ groupId: params.groupId })),
  push: url => dispatch(push(url))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(GroupDetail))
);
